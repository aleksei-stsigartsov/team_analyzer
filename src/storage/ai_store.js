import { get, writable } from 'svelte/store'
import { fetchEventSource } from '@microsoft/fetch-event-source'
import { countRegexMatches, formatReferences, getCustomRequestOrigin, initializeFetchOptions, removeArrayElementAt, updateArrayElementAt } from './lib/utils.js'
import { user } from './store.js'

export const conversationState = writable({
    conversationId: undefined,
    messages: [],
    error: undefined,
    isStreamingMessage: false,
    streamingMessage: undefined,
})

class RetriableError extends Error {
    constructor(message, { retryAfter = 1000, data } = {}) {
        super(message) // Call the parent class (Error) constructor
        this.name = 'RetriableError' // Overriding the name property
        this.retryAfter = retryAfter // Custom property to indicate when to retry
        this.data = data // Optional: Additional data about the error
    }
}


export async function createConversation(serverUrl) {
    const fetchOptions = {
        method: 'POST',
        headers: new Headers({
            'Content-Type': 'application/json',
            'X-Request-Origin': getCustomRequestOrigin() || '',
            'Authorization': `Bearer ${ get(user).token }`
        }),
    }

    try {
        const response = await fetch(`${ serverUrl }/conversations`, fetchOptions)
        if ( ! response.ok) throw new Error(`HTTP error! status: ${ response.status }`)

        const data = await response.json()
        conversationState.update(state => {
            return {
                ...state,
                conversationId: data._id
            }
        })
        return data
    } catch (error) {
        setConversationError('Failed to create conversation: ' + error.message)
    }
}

export const addMessageStreaming = async (message) => {
    const shouldStream = true
    const abortController = new AbortController()
    let finishedStreaming = false
    let finishedBuffering = ! shouldStream
    let streamedMessageId = null
    let references = null
    let bufferedTokens = []
    let streamedTokens = []
    const streamingIntervalMs = 50
    let moreToStream = true
    const streamingInterval = setInterval(async () => {
        const [nextToken, ...remainingTokens] = bufferedTokens

        bufferedTokens = remainingTokens

        if (nextToken) {
            await appendStreamingResponse(nextToken)

        }

        const allBufferedTokensDispatched =
            finishedStreaming && bufferedTokens.length === 0

        if (references && allBufferedTokensDispatched) {

            // Count the number of markdown code fences in the response. If
            // it's odd, the streaming message stopped in the middle of a
            // code block and we need to escape from it.
            const numCodeFences = countRegexMatches(
                /```/g,
                streamedTokens.join('')
            )
            if (numCodeFences % 2 !== 0) {
                await appendStreamingResponse('\n```\n\n')
            }

            await appendStreamingResponse(formatReferences(references))
            references = null
        }
        if ( ! finishedBuffering && allBufferedTokensDispatched) {
            if ( ! streamedMessageId) {
                streamedMessageId = createMessageId()
            }
            await finishStreamingResponse(streamedMessageId)
            finishedBuffering = true
        }
    }, streamingIntervalMs)

    /*    conversation.messages = conversation.messages.filter((msg) => msg.id !== 'loader')
        conversation.messages.forEach((msg) => {if (msg.role === 'assistant') msg.typewriter = false})
        conversation.messages.push({ role: 'user', content: userInput })
        conversation = conversation*/


    /*   userInput = ''
       answerLoad = true*/
       
    let endpoint = `http://localhost:3000/api/v1/conversations/${ get(conversationState).conversationId }/messages?stream=true`

    let fetchOptions = initializeFetchOptions({})
    try {


        await addMessage('user', message)
        //dispatch({ type: "createStreamingResponse", data: "" });
        await createStreamingResponse('')

        await fetchEventSource(endpoint, {
            ...fetchOptions,

            headers: Object.fromEntries(fetchOptions.headers),
            signal: abortController.signal ?? null,
            method: 'POST',
            body: JSON.stringify({ message }),
            openWhenHidden: true,

            async onmessage(ev) {
                if (process.env.NODE_ENV === 'development') {
                    console.debug('[EventSource]', ev)
                }
                const event = JSON.parse(ev.data)

                switch (event.type) {
                    case 'delta': {
                        const formattedData = event.data.replaceAll(`\\n`, `\n`)

                        bufferedTokens = [...bufferedTokens, formattedData]
                        streamedTokens = [...streamedTokens, formattedData]
                        break
                    }
                    case 'references': {
                        //onReferences(event.data);
                        references = event.data

                        break
                    }
                    case 'metadata': {
                        //onMetadata(event.data);
                        break
                    }
                    case 'finished': {

                        moreToStream = false
                        const messageId = event.data
                        streamedMessageId = messageId
                        finishedStreaming = true

                        break
                    }
                }
            },

            async onopen(response) {
                if (
                    response.ok &&
                    response.headers.get('content-type') === 'text/event-stream'
                ) {
                    return // everything's good
                }

                if (response.status === 400) {
                    const data = await response.json()
                    throw new Error(data.error ?? `Bad request`)
                }

                if (
                    response.status > 400 &&
                    response.status < 500 &&
                    response.status !== 429
                ) {
                    // client-side errors are usually non-retriable:
                    throw new Error(`Chatbot stream error: ${ response.statusText }`)
                } else {
                    // other errors are possibly retriable
                    throw new RetriableError(
                        `Chatbot stream error: ${ response.statusText }`,
                        {
                            retryAfter: 1000,
                            data: response,
                        }
                    )
                }
            },
            onclose() {
                if (moreToStream) {
                    throw new RetriableError('Chatbot stream closed unexpectedly')
                }
            },
            onerror(err) {
                //TODO: retry connection
                throw new RetriableError('Chatbot stream error')
            }

        })

    } catch (error) {
        abortController.abort()
        console.error(`Failed to add message: ${ error }`)
        const errorMessage = error instanceof Error ? error.message : String(error)
        await cancelStreamingResponse()
        clearInterval(streamingInterval)

        setConversationError(errorMessage)
        throw error
    }

    let cleanupInterval = null
    return new Promise((resolve) => {
        cleanupInterval = setInterval(() => {
            if (finishedBuffering) {
                clearInterval(streamingInterval)
                clearInterval(cleanupInterval)
                resolve()
            }
        }, streamingIntervalMs)
    })


}


const STREAMING_MESSAGE_ID = 'streaming-response' // This constant should match what's being used to identify streaming messages

export function createStreamingResponse(content) {
    conversationState.update(state => {
        // First, check if there's already a streaming message under processing
        const existingStreamingMessageIndex = state.messages.findIndex(message => message.id === STREAMING_MESSAGE_ID)
        if (existingStreamingMessageIndex !== -1) {
            console.error('A streamingMessage already exists')
            return state // Return current state if streaming message already exists
        }

        // Ensure there's a conversationId
        if ( ! state.conversationId) {
            console.error('Cannot createStreamingResponse without a conversationId')
            return state
        }

        // Generating a new streaming message
        let streamingMessage = createMessage('assistant', content)
        streamingMessage.id = STREAMING_MESSAGE_ID // Override the id to mark it as the streaming message

        // Add the newly created streaming message to the conversation's messages
        return {
            ...state,
            isStreamingMessage: true, // Set the flag to indicate streaming is in progress
            messages: [...state.messages, streamingMessage], // Include the new streaming message
        }
    })
}

export function addMessage(role, content, metadata) {
    conversationState.update(state => {
        // Validate conversation ID exists
        if ( ! state.conversationId) {
            console.error('Cannot addMessage without a conversationId')
            return state // Return the current state if validation fails
        }

        // Create a new message object
        const newMessage = createMessage(role, content, metadata)

        // Return the updated state with the new message added to the messages array
        return {
            ...state,
            messages: [...state.messages, newMessage]
        }
    })
}

export function appendStreamingResponse(data) {
    conversationState.update(state => {
        // Check for a valid conversationId before proceeding
        if ( ! state.conversationId) {
            console.error('Cannot appendStreamingResponse without a conversationId')
            return state
        }

        // Utilize the getStreamingMessage function to find the existing streaming message, if any

        const { streamingMessage, streamingMessageIndex } = getStreamingMessage(state.messages)
        if ( ! streamingMessage) {
            console.error('Cannot appendStreamingResponse without a streamingMessage. Make sure to dispatch createStreamingResponse first.')
            return state
        }

        // If a streaming message exists, concatenate the new data to its content
        const updatedStreamingMessage = { ...streamingMessage, content: streamingMessage.content + data }

        // Replace the old streaming message with the updated one in the messages array
        let updatedMessages = [...state.messages]
        updatedMessages[streamingMessageIndex] = updatedStreamingMessage

        return { ...state, messages: updatedMessages }
    })
}

export function cancelStreamingResponse() {
    conversationState.update(state => {
        const streamingMessageIndex = state.messages.findIndex(message => message.id === STREAMING_MESSAGE_ID)
        if (streamingMessageIndex === -1) {
            console.error('Cannot cancelStreamingResponse without a streamingMessage')
            return state
        }

        // Use the utility function to remove the streaming message from the messages array
        const messages = removeArrayElementAt(state.messages, streamingMessageIndex)

        return {
            ...state,
            isStreamingMessage: false, // Update the flag to indicate the streaming message is removed
            messages,
        }
    })
}

export function setConversationError(errorMessage) {
    conversationState.update(state => ({
        ...state,
        error: errorMessage, // Set or update the error message in the conversation state
    }))
    console.log('STATE', get(conversationState))
}

export function finishStreamingResponse(finalMessageId) {
    conversationState.update(state => {
        const { streamingMessage, streamingMessageIndex } = getStreamingMessage(state.messages)

        // Check if there's an ongoing streaming message to finish
        if ( ! streamingMessage) {
            console.error('Cannot finishStreamingResponse without a streamingMessage')
            return state
        }

        // Update the ID of the streaming message to its final ID
        const finalMessage = { ...streamingMessage, id: finalMessageId }

        // Update the messages array with the finalized message
        const updatedMessages = updateArrayElementAt(state.messages, streamingMessageIndex, finalMessage)

        return {
            ...state,
            isStreamingMessage: false, // Mark the streaming process as finished
            messages: updatedMessages
        }
    })
}

export function createMessageId() {
    const now = Date.now()
    const nonce = Math.floor(Math.random() * 100000)
    return String(now + nonce)
}

export default function createMessage(role, content, metadata) {
    const message = {
        id: createMessageId(), // Ensure createMessageId function is available
        role,
        content,
        createdAt: new Date().toISOString(),
    }

    // Attach metadata if provided.
    if (metadata) {
        message.metadata = metadata
    }

    return message
}

function getStreamingMessage(messages) {
    const streamingMessageIndex = messages.findIndex(message => message.id === STREAMING_MESSAGE_ID) // STREAMING_MESSAGE_ID is assumed to be a predefined constant
    const streamingMessage = streamingMessageIndex !== -1 ? messages[streamingMessageIndex] : null
    return { streamingMessage, streamingMessageIndex }
}

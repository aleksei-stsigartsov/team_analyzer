const drivelist = require('drivelist');

// Overrides
if ( ! String.prototype.format) {
    String.prototype.format = function() {
        return this.replace(/{(\d+)}/g, (match, number) => typeof arguments[number] !== 'undefined'
            ? arguments[number]
            : match
        )
    }
}

const exit = (msg, ...vals) => {
    console.error(msg.format(...vals))
    process.exit(1)
}

const info = (msg, ...vals) => {
    console.info(msg.format(...vals))
}
const error = (msg, ...vals) => console.error(msg.format(...vals))

const listDrives =() =>{
    return new Promise(async (resolve, reject) => {
        try {
            const mountPoints = []
            const drives = await drivelist.list()

            for(let drive of drives) {
                //let mount = drive.mountpoints.map(item => {return item.path}).filter(item => item.startsWith('/media'))
                let mount = drive.mountpoints.map(item => {return item.path})
                if(mount && mount.length) mountPoints.push(...mount)
            }
            resolve(mountPoints)
        } catch (err) {
            reject(err)
        }

    })
}


module.exports = {
    exit,
    info,
    error,
    listDrives
}

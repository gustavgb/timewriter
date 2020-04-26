import { database } from 'api'

const mapLog = log => ({
  ...log,
  duration: (log.start && log.end) ? new Date(log.end).getTime() - new Date(log.start).getTime() : 0,
  notes: log.notes || ''
})

export const getLogs = (userId) => {
  return database.ref(`logs/${userId}`).orderByChild('start').once('value').then(snapshot => {
    const logs = snapshot.val()
    const list = Object.keys(logs).map(key => ({
      ...mapLog(logs[key]),
      id: key
    }))
    return list
  })
}

export const newLog = (userId, options) => {
  return database.ref(`logs/${userId}`).transaction(logs => {
    if (!logs) {
      logs = []
    }

    logs.push(options)

    return logs
  })
}

export const startTimer = (userId) => new Promise((resolve, reject) => {
  database.ref(`timer/${userId}`).transaction(timer => {
    try {
      if (timer) {
        console.log(timer)
        throw new Error('Already has timer')
      } else {
        timer = {
          start: Date.now()
        }
      }
    } catch (err) {
      reject(err)
    }
    return timer
  })
    .then(resolve)
    .catch(reject)
})

export const stopTimer = (userId, notes) => new Promise((resolve, reject) => {
  let log = null
  database.ref(`timer/${userId}`).transaction(timer => {
    try {
      if (timer) {
        log = {
          end: Date.now(),
          notes,
          start: timer.start
        }
        timer = null
      }
    } catch (e) {
      reject(e)
    }
    return timer
  })
    .then(() => {
      if (!log) {
        reject(new Error('No timer started'))
      } else {
        return database.ref(`logs/${userId}`).transaction(logs => {
          if (!logs) {
            logs = []
          }

          logs.push(log)

          return logs
        })
      }
    })
    .then(resolve)
    .catch(reject)
})

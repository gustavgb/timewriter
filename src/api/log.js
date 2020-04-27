import { database } from 'api'

const mapLog = log => ({
  ...log,
  duration: (log.start && log.end) ? new Date(log.end).getTime() - new Date(log.start).getTime() : 0,
  notes: log.notes || ''
})

const mapUpdate = log => ({
  notes: log.notes,
  end: parseInt(log.end, 10),
  start: parseInt(log.start, 10)
})

export const getLogs = (userId, dateString) => {
  const now = new Date()
  now.setDate(1)
  const startAt = new Date(dateString || now)
  const endAt = new Date(startAt)
  endAt.setMonth(startAt.getMonth() + 1)
  console.log(startAt, endAt)

  return database
    .ref(`logs/${userId}`)
    .orderByChild('start')
    .startAt(startAt.getTime().toString())
    .endAt(endAt.getTime().toString())
    .once('value')
    .then(snapshot => {
      const logs = snapshot.val() || {}
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

    logs = [mapUpdate(options)].concat(logs)

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

          logs = [mapUpdate(log)].concat(logs)

          return logs
        })
      }
    })
    .then(resolve)
    .catch(reject)
})

export const editLog = (userId, logId, options) => new Promise((resolve, reject) => {
  let written = false
  database.ref(`logs/${userId}/${logId}`).transaction(log => {
    if (log) {
      written = true

      log = mapUpdate({
        ...log,
        ...options
      })

      return log
    }
  })
    .then(() => {
      if (!written) {
        reject(new Error('Log does not exist'))
      }
    })
})

export const removeLog = (userId, logId) => database.ref(`logs/${userId}/${logId}`).remove()

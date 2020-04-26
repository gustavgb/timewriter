import { database } from 'api'
import { object } from 'rxfire/database'
import { map } from 'rxjs/operators'

export const streamLogs = (userId) => {
  return object(database.ref(`logs/${userId}`))
    .pipe(map(logs => logs.snapshot.val()))
}

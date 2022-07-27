import { request } from './request'

const useApi = (data) => {
  return new Promise((resolve) => {
    request
      .post('', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((res) => {
        resolve([null, res])
      })
      .catch((err) => {
        resolve([err, undefined])
      })
  })
}

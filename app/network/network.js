import axios from 'axios'
import qs from 'qs'
import { I18nManager } from 'react-native'
import { RIDER, getAppSide, getSessionId } from '../utils/common'
import { DRIVER_BASE_URL, RIDER_BASE_URL } from '../utils/constants'

// // 'localhost/api/v1'
// axios.defaults.baseURL = BASE_URL
const lang = I18nManager.isRTL ? 'ar' : 'en'

export const Post = async ({ data }) => {
    // Optionally, replace this with your method to get the session ID or token if needed
    const sessio_id = await getSessionId()
    // const sessio_id = 'NjFjNGkydnFqM2xmcDNxdXZ2YzBxaHFzdjU=' dummy session id for test
    const appSide = await getAppSide()
    const endpoint = sessio_id
        ? `${RIDER_BASE_URL}?sess_id=${sessio_id}`
        : RIDER_BASE_URL
    const driverEndPoint = sessio_id
        ? `${DRIVER_BASE_URL}?sess_id=${sessio_id}`
        : DRIVER_BASE_URL
    let appEndPoint = appSide === RIDER ? endpoint : driverEndPoint
    console.log(' ===========appEndPoint =========', appEndPoint)
    return new Promise((resolve, reject) => {
        axios
            .post(appEndPoint, qs.stringify(data), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',

                    'Accept-Language': 'en', // Make sure `lang` is defined in your context
                },
            })
            .then((response) => {
                // console.log(' ===========RESPONSE=========', response)
                resolve(response?.data)
            })
            .catch((error) => {
                console.error('Error:', endpoint, error)
                reject(error)
            })
    })
}

export const PostData = async ({ data }) => {
    // Optionally, replace this with your method to get the session ID or token if needed
    const sessio_id = await getSessionId()
    // const sessio_id = 'NjFjNGkydnFqM2xmcDNxdXZ2YzBxaHFzdjU=' dummy session id for test
    const appSide = await getAppSide()
    const endpoint = sessio_id
        ? `${RIDER_BASE_URL}?sess_id=${sessio_id}`
        : RIDER_BASE_URL
    const driverEndPoint = sessio_id
        ? `${DRIVER_BASE_URL}?sess_id=${sessio_id}`
        : DRIVER_BASE_URL
    let appEndPoint = appSide === RIDER ? endpoint : driverEndPoint
    console.log(' ===========appEndPoint =========', appEndPoint)
    return new Promise((resolve, reject) => {
        axios
            .post(appEndPoint, data, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',

                    'Accept-Language': 'en', // Make sure `lang` is defined in your context
                },
            })
            .then((response) => {
                // console.log(' ===========RESPONSE=========', response)
                resolve(response?.data)
            })
            .catch((error) => {
                console.error('Error:', endpoint, error)
                reject(error)
            })
    })
}

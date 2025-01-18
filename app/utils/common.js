import AsyncStorage from '@react-native-async-storage/async-storage'
import ImagePicker from 'react-native-image-crop-picker'
import RNFS from 'react-native-fs' // To read file as base64

export const TOKEN = 'token'
export const APP_SIDE = 'app_side'
export const DRIVER = 'DRIVER'
export const RIDER = 'RIDER'
export const SESSION_ID = 'SESSION_ID'

export const getUserToken = async () => {
    return AsyncStorage.getItem(TOKEN)
}
export const setUserToken = async (token) => {
    AsyncStorage.setItem(TOKEN, token)
}
export const deleteUserToken = async () => {
    AsyncStorage.removeItem(TOKEN)
}

//app side
export const getAppSide = async () => {
    return AsyncStorage.getItem(APP_SIDE)
}
export const setAppSide = async (token) => {
    AsyncStorage.setItem(APP_SIDE, token)
}
export const deleteAppSide = async () => {
    AsyncStorage.removeItem(APP_SIDE)
}

export const citiesInPakistan = [
    { id: '1', name: 'Karachi' },
    { id: '2', name: 'Lahore' },
    { id: '3', name: 'Islamabad' },
    { id: '4', name: 'Rawalpindi' },
    { id: '5', name: 'Faisalabad' },
    { id: '6', name: 'Peshawar' },
    { id: '7', name: 'Quetta' },
    { id: '8', name: 'Multan' },
    { id: '9', name: 'Sialkot' },
    { id: '10', name: 'Gujranwala' },
    { id: '11', name: 'Hyderabad' },
    { id: '12', name: 'Sukkur' },
    { id: '13', name: 'Sargodha' },
    { id: '14', name: 'Bahawalpur' },
    { id: '15', name: 'Mardan' },
    { id: '16', name: 'Abbottabad' },
    { id: '17', name: 'Mirpur (AJK)' },
    { id: '18', name: 'Muzaffarabad' },
    { id: '19', name: 'Jhelum' },
    { id: '20', name: 'Sahiwal' },
    { id: '21', name: 'Dera Ghazi Khan' },
    { id: '22', name: 'Rahim Yar Khan' },
    { id: '23', name: 'Kasur' },
    { id: '24', name: 'Mingora (Swat)' },
    { id: '25', name: 'Wah Cantt' },
    { id: '26', name: 'Mansehra' },
]
export const colorCodes = [
    { id: '1', name: 'Red', colorCode: '#FF0000' },
    { id: '2', name: 'Green', colorCode: '#00FF00' },
    { id: '3', name: 'Blue', colorCode: '#0000FF' },
    { id: '4', name: 'Yellow', colorCode: '#FFFF00' },
    { id: '5', name: 'Black', colorCode: '#000000' },
    { id: '6', name: 'White', colorCode: '#FFFFFF' },
    { id: '7', name: 'Purple', colorCode: '#800080' },
    { id: '8', name: 'Orange', colorCode: '#FFA500' },
    { id: '9', name: 'Pink', colorCode: '#FFC0CB' },
    { id: '10', name: 'Brown', colorCode: '#A52A2A' },
    { id: '11', name: 'Gray', colorCode: '#808080' },
    { id: '12', name: 'Cyan', colorCode: '#00FFFF' },
    { id: '13', name: 'Magenta', colorCode: '#FF00FF' },
    { id: '14', name: 'Lime', colorCode: '#00FF00' },
    { id: '15', name: 'Navy', colorCode: '#000080' },
    { id: '16', name: 'Teal', colorCode: '#008080' },
    { id: '17', name: 'Olive', colorCode: '#808000' },
    { id: '18', name: 'Maroon', colorCode: '#800000' },
    { id: '19', name: 'Beige', colorCode: '#F5F5DC' },
    { id: '20', name: 'Lavender', colorCode: '#E6E6FA' },
]

//app side
export const getSessionId = async () => {
    return AsyncStorage.getItem(SESSION_ID)
}
export const setSessionId = async (id) => {
    AsyncStorage.setItem(SESSION_ID, id)
}
export const deleteSessionId = async () => {
    AsyncStorage.removeItem(SESSION_ID)
}
// image
export const pickImage = async () => {
    try {
        const image = await ImagePicker.openPicker({
            width: 300,
            height: 300,
            cropping: true,
        })
        console.log('=== Image selected ===', image)
        return image // Return the image path
    } catch (error) {
        console.log('Error picking image: ', error)
        return null // Return null if there's an error
    }
}

export const convertToBase64 = async (imagePath) => {
    const base64Image = await RNFS.readFile(imagePath, 'base64')
    return base64Image
}

export const savePassword = async (password) => {
    console.log('========password========', password)
    AsyncStorage.setItem('user_pwd', password)
}

export const getPassword = async () => {
    return AsyncStorage.getItem('user_pwd')
}
export const deletePassword = () => {
    AsyncStorage.removeItem('user_pwd')
}

//phone
export const savePhone = async (phone) => {
    AsyncStorage.setItem('phone', phone)
}

export const getPhone = async () => {
    return AsyncStorage.getItem('phone')
}
export const deletePhone = () => {
    AsyncStorage.removeItem('phone')
}

//Otp
export const saveOtp = async (otp) => {
    AsyncStorage.setItem('otp', otp)
}

export const getOtp = async () => {
    return AsyncStorage.getItem('otp')
}
export const deleteOtp = () => {
    AsyncStorage.removeItem('otp')
}

//stripHtmlTags
export const stripHtmlTags = (html) => {
    return html
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .trim()
}

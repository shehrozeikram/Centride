import React, { useEffect, useState } from 'react'
import {
    StyleSheet,
    View,
    Text,
    Image,
    TextInput,
    TouchableOpacity,
    Alert,
} from 'react-native'
import Ionicons from 'react-native-vector-icons/Ionicons'
import DocumentPicker from 'react-native-document-picker'
import Color from '../../../utils/Color'
import AppButton from '../../../components/AppButton'
import AppInputField from '../../../components/AppInputField'
import { convertToBase64, pickImage } from '../../../utils/common'
import { Post } from '../../../network/network'
import { useRoute } from '@react-navigation/native'

const CnicFront = () => {
    const [expiryDate, setExpiryDate] = useState('')
    const [cnicNumber, setCnicNumber] = useState('')
    const [selectedImage, setSelectedImage] = useState(null)
    const [doc_id, setDocId] = useState()
    const route = useRoute()
    useEffect(() => {
        handleRoute()
    }, [route?.params])
    const handleRoute = () => {
        if (route.params) {
            console.log('===========ROUTE==========', route.params?.doc_Id)
            setDocId(route?.params?.doc_Id)
        }
    }

    const handleImagePick = async () => {
        const imagePath = await pickImage()
        setSelectedImage(imagePath)
    }

    const handleImageUpdate = async (imagePath) => {
        console.log('=========Image Ready To Upload==============')
        const base64Image = await convertToBase64(imagePath)
        const documentData = {
            action: 'saveUserDoc',
            photo: `data:image/jpeg;base64,${base64Image}`, // Base64 string
            doc_id: doc_id,
            doc_expiry: expiryDate,
            doc_img: base64Image,
            doc_id_input: cnicNumber,
        }

        // Update user photo
        Post({
            data: documentData,
        })
            .then((response) => {
                console.log('======IMAGE-UPDATE====', response)
            })
            .catch((error) => {
                console.log('======IMAGE-UPDATE ERROR====', error)
            })
    }
    const handleSubmit = async () => {
        await handleImageUpdate(selectedImage?.path)
        // Alert.alert(
        //     'Submitted',
        //     `CNIC Number: ${cnicNumber}\nExpiry Date: ${expiryDate}`,
        // )
    }

    return (
        <View style={styles.container}>
            {/* Required Tag */}
            <View style={styles.requiredContainer}>
                <Ionicons name='information-circle' size={16} color='#FF5722' />
                <Text style={styles.requiredTag}>Required</Text>
            </View>

            {/* Title and Description */}
            <View style={styles.infoContainer}>
                <Text style={styles.title}>CNIC Front</Text>
                <Text style={styles.description}>
                    Please upload a valid copy of your CNIC (Front).
                </Text>
            </View>

            {/* Sample Image Section */}
            <TouchableOpacity
                onPress={handleImagePick}
                style={styles.imageContainer}>
                {selectedImage ? (
                    <Image
                        source={{ uri: selectedImage?.path }}
                        style={styles.image}
                    />
                ) : (
                    <Image
                        source={require('../../../assets/personal-doc-sample.png')} // Replace with your sample image path
                        style={styles.sampleImage}
                    />
                )}
            </TouchableOpacity>

            {/* Expiry Date Input */}
            <View style={styles.inputContainer}>
                <Text style={styles.label}>
                    Enter the expiry date of the document
                </Text>
                <TextInput
                    style={styles.input}
                    placeholder='YYYY-MM-DD'
                    value={expiryDate}
                    onChangeText={setExpiryDate}
                />
            </View>

            {/* CNIC Number Input */}
            <View style={styles.inputContainer}>
                <Text style={styles.label}>
                    Enter the CNIC number of the driver
                </Text>
                <Text style={styles.subLabel}>CNIC number without spaces</Text>
                <TextInput
                    style={styles.input}
                    placeholder='12345-1234567-1'
                    value={cnicNumber}
                    onChangeText={setCnicNumber}
                />
            </View>

            {/* Submit Button */}

            <AppButton onPress={handleSubmit} name='Submit' />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f9f9f9',
        // marginTop: 50,
    },
    requiredContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    requiredTag: {
        marginLeft: 5,
        color: '#FF5722',
        fontWeight: 'bold',
    },
    infoContainer: {
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    description: {
        fontSize: 16,
        color: '#555',
    },
    imageContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 8,
        padding: 20,
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: '#ccc',
        marginBottom: 20,
    },
    sampleImage: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        resizeMode: 'contain',
    },
    image: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        marginBottom: 10,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        color: '#333',
        marginBottom: 5,
    },
    subLabel: {
        fontSize: 14,
        color: '#777',
        marginBottom: 5,
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 4,
        paddingHorizontal: 10,
    },
})

export default CnicFront

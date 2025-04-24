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
import { Post } from '../../../network/network'
import { useNavigation, useRoute } from '@react-navigation/native'
import { convertToBase64, pickImage, getSessionId } from '../../../utils/common'
import { DRIVER_BASE_URL } from '../../../utils/constants'

const VehicleDocumentFront = () => {
    const [expiryDate, setExpiryDate] = useState('')
    const [cnicNumber, setCnicNumber] = useState('')
    const [selectedImage, setSelectedImage] = useState(null)
    const [doc_id, setDocId] = useState()
    const [docStatus, setDocStatus] = useState('Required')
    const route = useRoute()
    const navigation = useNavigation()

    const getStatusColor = (status) => {
        switch (status) {
            case '0': return '#FFA500'; // Pending - Orange
            case '1': return '#FF4444'; // Failed - Red
            case '2': return '#8B00FF'; // Expired - Purple
            case '3': return '#4CAF50'; // Approved - Green
            default: return '#E91E63'; // Required - Pink
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case '0': return 'Pending';
            case '1': return 'Failed';
            case '2': return 'Expired';
            case '3': return 'Approved';
            default: return 'Required';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case '0': return 'time-outline';
            case '1': return 'close-circle-outline';
            case '2': return 'alert-circle-outline';
            case '3': return 'checkmark-circle-outline';
            default: return 'alert-circle-outline';
        }
    };

    const handleDocs = async () => {
        try {
            const sess_id = await getSessionId();
            const url = `${DRIVER_BASE_URL}?sess_id=${sess_id}`;
    
            const body = new URLSearchParams({
                action: "getUserDocs",
            }).toString();
    
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: body,
            });
    
            const responseData = await response.json();
            console.log('responseData', responseData);
    
            if (responseData.success === 1 && responseData.user_docs) {
                const doc = responseData.user_docs[doc_id];
                if (doc) {
                    setDocStatus(doc.u_doc_status || '0');
                    if (['0', '2', '3'].includes(doc.u_doc_status) && doc.u_doc_img) {
                        setSelectedImage({ path: doc.u_doc_img });
                    }
                }
            }
        } catch (error) {
            console.error("Error in handleDocs:", error);
        }
    };

    useEffect(() => {
        handleRoute()
    }, [route?.params])

    useEffect(() => {
        if (doc_id) {
            handleDocs();
        }
    }, [doc_id])

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
            //   doc_expiry:expiryDate,
            doc_img: base64Image,
        }

        // Update user photo
        Post({
            data: documentData,
        })
            .then((response) => {
                navigation.goBack()
                console.log('======IMAGE-UPDATE====', response)
            })
            .catch((error) => {
                console.log('======IMAGE-UPDATE ERROR====', error)
            })
    }

    const handleSubmit = () => {
        handleImageUpdate(selectedImage?.path)
    }

    return (
        <View style={styles.container}>
            {/* Status Tag */}
            <View style={[styles.requiredContainer, { backgroundColor: getStatusColor(docStatus) }]}>
                <Ionicons name={getStatusIcon(docStatus)} size={16} color="white" />
                <Text style={[styles.requiredTag, { color: 'white' }]}>{getStatusText(docStatus)}</Text>
            </View>

            {/* Title and Description */}
            <View style={styles.infoContainer}>
                <Text style={styles.title}>Vehicle Document Front</Text>
                <Text style={styles.description}>
                    Front side of Vehicle Document.
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
                        source={require('../../../assets/vehicle-doc-sample.png')}
                        style={styles.sampleImage}
                    />
                )}
            </TouchableOpacity>

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
    },
    requiredContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    requiredTag: {
        marginLeft: 5,
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

export default VehicleDocumentFront

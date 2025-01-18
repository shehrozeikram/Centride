import React, { useState } from 'react'
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    StyleSheet,
    ImageBackground,
    Dimensions,
} from 'react-native'

const { height, width } = Dimensions.get('window')

const DriverAssignedModal = () => {
    const [isVisible, setIsVisible] = useState(false)

    const toggleModal = () => {
        setIsVisible(!isVisible)
    }

    return (
        <View style={styles.container}>
            {/* Modal */}
            <Modal
                transparent={true}
                visible={isVisible}
                onRequestClose={toggleModal}
                animationType='fade'>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {/* Top Image Background (40% of the screen height) */}
                        <ImageBackground
                            source={require('../assets/notification_bg.jpg')}
                            style={styles.imageBackground}
                        />

                        {/* Heading */}
                        <Text style={styles.heading}>
                            Txyco - Driver Assigned
                        </Text>

                        {/* Body Text */}
                        <Text style={styles.bodyText}>
                            A driver has been assigned to your ride with booking
                            ID (08431) and is on his way. You will be contacted
                            shortly.
                        </Text>

                        {/* Ok Button */}
                        <TouchableOpacity
                            style={styles.okButton}
                            onPress={toggleModal}>
                            <Text style={styles.okButtonText}>Ok</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    showButton: {
        padding: 10,
        backgroundColor: '#2196F3',
        borderRadius: 5,
    },
    showButtonText: {
        color: 'white',
        fontSize: 16,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: width * 0.9,
        borderRadius: 10,
        backgroundColor: 'white',
        padding: 20,
        alignItems: 'center',
    },
    imageBackground: {
        width: '100%',
        height: height * 0.4,
        borderRadius: 10,
        overflow: 'hidden',
        marginBottom: 20,
    },
    heading: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    bodyText: {
        fontSize: 14,
        color: '#555',
        textAlign: 'center',
        marginBottom: 20,
    },
    okButton: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        backgroundColor: '#4CAF50',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 5,
    },
    okButtonText: {
        color: 'white',
        fontSize: 16,
    },
})

export default DriverAssignedModal

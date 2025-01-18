import { useIsFocused, useNavigation } from '@react-navigation/native'
import React, { useEffect, useState } from 'react'
import {
    StyleSheet,
    View,
    Text,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Platform,
} from 'react-native'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Ionicons from 'react-native-vector-icons/Ionicons'
import Style from '../../../utils/Styles'
import Header from '../../../components/Header'
import { getSessionId } from '../../../utils/common'
import Spacing from '../../../components/Spacing'

const Documents = () => {
    const navigation = useNavigation()
    const [documentData, setDocumentData] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // const onBackPress = () => {
    //     navigation.goBack()
    // }

    const onPress = (item) => {
        if (item?.screen) {
            navigation.navigate(item?.screen, { doc_Id: item?.id })
        } else {
            console.log('No screen defined for this document.')
        }
    }

    const DocumentItem = ({ item }) => {
        return (
            <TouchableOpacity
                style={styles.itemContainer}
                onPress={() => onPress(item)}>
                <FontAwesome name='file-text' size={24} color='#4CAF50' />
                <Text style={styles.titleText}>{item.title}</Text>
                {item.required && (
                    <View style={styles.requiredContainer}>
                        <Ionicons
                            name='information-circle'
                            size={16}
                            color='#FF5722'
                        />
                        <Text style={styles.requiredTag}>Required</Text>
                    </View>
                )}
                <Ionicons name='chevron-forward' size={20} color='#000' />
            </TouchableOpacity>
        )
    }

    const fetchDocuments = async () => {
        const sess_id = await getSessionId()
        const body = new URLSearchParams({ action: 'getUserDocs' })

        try {
            const response = await fetch(
                `https://appserver.txy.co/ajaxdriver_2_1_1.php?sess_id=${sess_id}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: body.toString(),
                },
            )

            if (!response.ok) {
                throw new Error('Network response was not ok')
            }

            const json = await response.json()

            if (json.success === 1) {
                const docs = Object.values(json.user_docs).map((doc) => ({
                    id: doc.d_id,
                    title: doc.title,
                    required: doc.status === '1',
                    screen: getScreenName(doc.d_id),
                }))
                setDocumentData(docs)
            } else {
                throw new Error('Failed to fetch documents')
            }
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    // Function to map document IDs to screen names
    const getScreenName = (docId) => {
        const screens = {
            1: 'CnicFront',
            2: 'CnicBack',
            3: 'DrivingLicenseFront',
            4: 'DrivingLicenseBack',
            5: 'VehicleDocumentFront',
            6: 'VehicleDocumentBack',
            7: 'IdVerification',
            8: 'VehiclePhoto',
        }
        return screens[docId] || 'Documents' // Replace 'DefaultScreen' with an actual screen name if needed
    }
    const isFocused = useIsFocused()
    useEffect(() => {
        fetchDocuments()
    }, [isFocused])

    if (loading) {
        return (
            <ActivityIndicator
                size='large'
                color='#0000ff'
                style={{ flex: 1 }}
            />
        )
    }

    if (error) {
        return <Text>Error: {error}</Text>
    }

    return (
        <View style={[Style.container, Style.hPaddingSixteen]}>
            <Spacing val={Platform.OS === 'ios' ? 30 : 20} />
            {/* <Header
                LeftIcon={true}
                onPressLeftIcon={onBackPress}
                title={'Documents'}
            /> */}
            <Spacing val={20} />
            <Text style={styles.headerText}>
                Upload valid copies of the following documents to keep your
                account active
            </Text>
            <FlatList
                data={documentData}
                renderItem={DocumentItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f9f9f9',
        marginTop: 60,
    },
    headerText: {
        fontSize: 16,
        color: '#333',
        marginBottom: 12,
        textAlign: 'center',
        fontWeight: 'semibold',
    },
    listContainer: {
        paddingBottom: 20,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 8,
        padding: 15,
        marginVertical: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 2.62,
        elevation: 4,
    },
    titleText: {
        flex: 1,
        marginLeft: 15,
        fontSize: 16,
        color: '#333',
    },
    requiredContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 10,
    },
    requiredTag: {
        marginLeft: 5,
        color: '#FF5722',
        fontWeight: 'bold',
    },
})

export default Documents

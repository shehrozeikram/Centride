// DocumentList.js
import { useNavigation } from '@react-navigation/native'
import React from 'react'
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    Alert,
} from 'react-native'
import Style from '../../../utils/Styles'
import Spacing from '../../../components/Spacing'
import Header from '../../../components/Header'

const documents = [
    {
        id: '1',
        name: 'Document 1',
        type: 'PDF',
        size: '2 MB',
        date: '2024-09-05',
    },
    {
        id: '2',
        name: 'Document 2',
        type: 'Word',
        size: '1 MB',
        date: '2024-09-04',
    },
    // Add more document items here
]

const Documents = () => {
    const handleDocumentPress = (doc) => {
        Alert.alert('Document Clicked', `You clicked on ${doc.name}`)
    }

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.item}
            onPress={() => handleDocumentPress(item)}
        >
            <Text style={styles.name}>{item.name}</Text>
            <Text>
                {item.type} | {item.size} | {item.date}
            </Text>
        </TouchableOpacity>
    )
    const navigation = useNavigation()
    const onBackPress = () => {
        navigation.goBack()
    }

    return (
        <View style={[Style.container, Style.hPaddingSixteen]}>
            <Spacing val={Platform.OS === 'ios' && 35} />
            <Header LeftIcon={true} onPressLeftIcon={onBackPress} />
            <Spacing val={15} />
            <FlatList
                data={documents}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginTop: '20%',
        flex: 1,
        padding: 10,
    },
    item: {
        padding: 20,
        marginVertical: 8,
        marginHorizontal: 16,
        backgroundColor: '#f9f9f9',
        borderRadius: 5,
        elevation: 3,
    },
    name: {
        fontSize: 18,
        fontWeight: 'bold',
    },
})

export default Documents

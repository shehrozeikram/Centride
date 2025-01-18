// import React, { useState, useEffect } from 'react'
// import {
//     View,
//     Text,
//     TextInput,
//     FlatList,
//     StyleSheet,
//     TouchableOpacity,
// } from 'react-native'
// import Icon from 'react-native-vector-icons/FontAwesome' // Import FontAwesome for the checkmark icon
// import AsyncStorage from '@react-native-async-storage/async-storage'
// import Header from '../../components/Header'
// import { useNavigation } from '@react-navigation/native'
// import Spacing from '../../components/Spacing'
// import Style from '../../utils/Styles'

// import { useTranslation } from 'react-i18next'

// // Example data with emoji flags
// const data = [
//     { id: '1', flag: '🇬🇧', language: 'English', translation: 'English' },
//     { id: '2', flag: '🇵🇰', language: 'Urdu', translation: 'اردو' },
//     { id: '3', flag: '🇨🇳', language: 'Chinese', translation: '中国' },
//     { id: '4', flag: '🇫🇷', language: 'French', translation: 'Français' },
//     { id: '5', flag: '🇩🇪', language: 'Deutsch', translation: 'Deutsch' },
//     { id: '6', flag: '🇦🇪', language: 'Arabic', translation: 'العربية' },
//     { id: '7', flag: '🇷🇺', language: 'Russian', translation: 'Русский' },
//     { id: '8', flag: '🇵🇹', language: 'Portuguese', translation: 'Português' },
// ]

// const Language = () => {
//     const { t, i18n } = useTranslation()
//     const [search, setSearch] = useState('')
//     const [selectedId, setSelectedId] = useState(null)
//     const navigation = useNavigation()
//     useEffect(() => {
//         const loadSelectedLanguage = async () => {
//             try {
//                 const savedId = await AsyncStorage.getItem('selectedLanguageId')
//                 if (savedId) {
//                     setSelectedId(savedId)
//                 } else {
//                     // Default to English if no selection is saved
//                     setSelectedId('1')
//                 }
//             } catch (error) {
//                 console.error('Failed to load the selected language:', error)
//             }
//         }

//         loadSelectedLanguage()
//     }, [])

//     useEffect(() => {
//         const saveSelectedLanguage = async () => {
//             try {
//                 if (selectedId) {
//                     await AsyncStorage.setItem('selectedLanguageId', selectedId)
//                     // Change the language in i18next when a language is selected
//                     if (selectedId === '1') {
//                         i18n.changeLanguage('en')
//                     } else if (selectedId === '2') {
//                         i18n.changeLanguage('ur')
//                     } else if (selectedId === '3') {
//                         i18n.changeLanguage('ch')
//                     }
//                 }
//             } catch (error) {
//                 console.error('Failed to save the selected language:', error)
//             }
//         }

//         saveSelectedLanguage()
//     }, [selectedId, i18n])

//     const filteredData = data.filter((item) =>
//         item.language.toLowerCase().includes(search.toLowerCase()),
//     )

//     const handleSelect = (itemId) => {
//         setSelectedId(itemId)
//         setSearch('') // Clear search input on selection
//     }
//     // const onBackPress = () => {
//     //     navigation.goBack()
//     // }

//     const renderItem = ({ item }) => (
//         <TouchableOpacity
//             style={[
//                 styles.itemContainer,
//                 {
//                     backgroundColor:
//                         item.id === selectedId ? '#e0e0e0' : '#fff',
//                 }, // Highlight selected item
//             ]}
//             onPress={() => handleSelect(item.id)}>
//             <View style={styles.itemContent}>
//                 <Text style={styles.flagText}>{item.flag}</Text>
//                 <Text style={styles.languageText}>
//                     {item.language} ({item.translation})
//                 </Text>
//             </View>
//             {item.id === selectedId && (
//                 <Icon name='check-circle' size={20} color='#4caf50' />
//             )}
//         </TouchableOpacity>
//     )

//     return (
//         <View style={[Style.container, Style.hPaddingSixteen]}>
//             <Spacing val={Platform.OS === 'ios' && 35} />

//             <Text>{t('select_no_of_learners')}</Text>
//             {/* <Header LeftIcon={true} onPressLeftIcon={onBackPress} /> */}
//             <Spacing val={20} />
//             <TextInput
//                 style={styles.searchInput}
//                 // placeholder='Search...'
//                 placeholder={t('search_placeholder')}
//                 value={search}
//                 onChangeText={setSearch}
//             />
//             <FlatList
//                 data={filteredData}
//                 renderItem={renderItem}
//                 keyExtractor={(item) => item.id}
//             />
//         </View>
//     )
// }

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         paddingTop: Platform.OS === 'ios' ? 36 : 60,
//         paddingHorizontal: 20,
//     },
//     searchInput: {
//         height: 45,
//         paddingHorizontal: 15,
//         backgroundColor: '#f0f0f0',
//         borderRadius: 25,
//         marginBottom: 20,
//         fontSize: 16,
//         elevation: 3,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.1,
//         shadowRadius: 5,
//     },
//     itemContainer: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         paddingVertical: 15,
//         paddingHorizontal: 20,
//         borderRadius: 10,
//         marginBottom: 10,
//         borderBottomWidth: 1,
//         borderBottomColor: '#ddd',
//     },
//     itemContent: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         flex: 1,
//     },
//     flagText: {
//         fontSize: 30,
//         marginRight: 15, // Gap between flag and language
//     },
//     languageText: {
//         fontSize: 16,
//         fontWeight: 'bold',
//         flex: 1,
//     },
// })

// export default Language

import React, { useState, useEffect } from 'react'
import {
    View,
    Text,
    TextInput,
    FlatList,
    StyleSheet,
    TouchableOpacity,
} from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome' // Import FontAwesome for the checkmark icon
import AsyncStorage from '@react-native-async-storage/async-storage'
import Header from '../../components/Header'
import { useNavigation } from '@react-navigation/native'
import Spacing from '../../components/Spacing'
import Style from '../../utils/Styles'

import { useTranslation } from 'react-i18next'

// Example data with emoji flags
const data = [
    { id: '1', flag: '🇬🇧', language: 'English', translation: 'English' },
    { id: '2', flag: '🇵🇰', language: 'Urdu', translation: 'اردو' },
    { id: '3', flag: '🇨🇳', language: 'Chinese', translation: '中国' },
    { id: '4', flag: '🇫🇷', language: 'French', translation: 'Français' },
    { id: '5', flag: '🇩🇪', language: 'Deutsch', translation: 'Deutsch' },
    { id: '6', flag: '🇦🇪', language: 'Arabic', translation: 'العربية' },
    { id: '7', flag: '🇷🇺', language: 'Russian', translation: 'Русский' },
    { id: '8', flag: '🇵🇹', language: 'Portuguese', translation: 'Português' },
]

const Language = () => {
    const { t, i18n } = useTranslation()
    const [search, setSearch] = useState('')
    const [selectedId, setSelectedId] = useState(null)
    const navigation = useNavigation()

    useEffect(() => {
        const loadSelectedLanguage = async () => {
            try {
                const savedId = await AsyncStorage.getItem('selectedLanguageId')
                if (savedId) {
                    setSelectedId(savedId)
                } else {
                    // Default to English if no selection is saved
                    setSelectedId('1')
                }
            } catch (error) {
                console.error('Failed to load the selected language:', error)
            }
        }

        loadSelectedLanguage()
    }, [])

    useEffect(() => {
        const saveSelectedLanguage = async () => {
            try {
                if (selectedId) {
                    await AsyncStorage.setItem('selectedLanguageId', selectedId)
                    // Change the language in i18next when a language is selected
                    if (selectedId === '1') {
                        i18n.changeLanguage('en')
                    } else if (selectedId === '2') {
                        i18n.changeLanguage('ur')
                    } else if (selectedId === '3') {
                        i18n.changeLanguage('ch') // Change to Chinese (Simplified) language code
                    } else if (selectedId === '4') {
                        i18n.changeLanguage('fr')
                    } else if (selectedId === '5') {
                        i18n.changeLanguage('de')
                    } else if (selectedId === '6') {
                        i18n.changeLanguage('ar')
                    } else if (selectedId === '7') {
                        i18n.changeLanguage('ru')
                    } else if (selectedId === '8') {
                        i18n.changeLanguage('pt')
                    }
                }
            } catch (error) {
                console.error('Failed to save the selected language:', error)
            }
        }

        saveSelectedLanguage()
    }, [selectedId, i18n])

    const filteredData = data.filter((item) =>
        item.language.toLowerCase().includes(search.toLowerCase()),
    )

    const handleSelect = (itemId) => {
        setSelectedId(itemId)
        setSearch('') // Clear search input on selection
    }

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={[
                styles.itemContainer,
                {
                    backgroundColor:
                        item.id === selectedId ? '#e0e0e0' : '#fff',
                }, // Highlight selected item
            ]}
            onPress={() => handleSelect(item.id)}>
            <View style={styles.itemContent}>
                <Text style={styles.flagText}>{item.flag}</Text>
                <Text style={styles.languageText}>
                    {item.language} ({item.translation})
                </Text>
            </View>
            {item.id === selectedId && (
                <Icon name='check-circle' size={20} color='#4caf50' />
            )}
        </TouchableOpacity>
    )

    return (
        <View style={[Style.container, Style.hPaddingSixteen]}>
            <Spacing val={Platform.OS === 'ios' && 35} />
            <Text>{t('select_no_of_learners')}</Text>
            <Spacing val={20} />
            <TextInput
                style={styles.searchInput}
                placeholder={t('search_placeholder')}
                value={search}
                onChangeText={setSearch}
            />
            <FlatList
                data={filteredData}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Platform.OS === 'ios' ? 36 : 60,
        paddingHorizontal: 20,
    },
    searchInput: {
        height: 45,
        paddingHorizontal: 15,
        backgroundColor: '#f0f0f0',
        borderRadius: 25,
        marginBottom: 20,
        fontSize: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 10,
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    itemContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    flagText: {
        fontSize: 30,
        marginRight: 15, // Gap between flag and language
    },
    languageText: {
        fontSize: 16,
        fontWeight: 'bold',
        flex: 1,
    },
})

export default Language

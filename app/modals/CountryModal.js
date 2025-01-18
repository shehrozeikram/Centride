import React from 'react'
import {
    Modal,
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Pressable,
} from 'react-native'
import Style from '../utils/Styles'
import Spacing from '../components/Spacing'
import Color from '../utils/Color'

const CountrySelectorModal = ({ visible, onClose, countries, onSelect }) => {
    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.itemContainer}
            onPress={() => {
                onSelect(item)
                onClose()
            }}
        >
            <View style={[Style.flexRow, styles.textStyle, Style.alignCenter]}>
                <Text>{item?.flag}</Text>
                <Text
                    style={[
                        Style.fontBold,
                        Style.colorBlack,
                        Style.label,
                        Style.widthFull,
                    ]}
                >
                    {item.name}
                </Text>
            </View>

            <Text style={[Style.fontMedium, Style.colorBlack, Style.label]}>
                {item?.dial_code}
            </Text>
        </TouchableOpacity>
    )
    const ListHeaderComponent = () => {
        return <Spacing val={20} />
    }
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType='slide'
            onRequestClose={onClose}
        >
            <Pressable onPress={onClose} style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <Text
                        style={[
                            Style.textCenter,
                            Style.fontBold,
                            Style.heading,
                            Style.colorBlack,
                        ]}
                    >
                        Select Country Code
                    </Text>

                    <FlatList
                        showsVerticalScrollIndicator={false}
                        data={countries}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={renderItem}
                        ListHeaderComponent={ListHeaderComponent}
                    />
                </View>
            </Pressable>
        </Modal>
    )
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    modalContainer: {
        height: '55%',
        width: '100%',
        backgroundColor: 'white',
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 20,
    },
    itemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 25,
        borderBottomWidth: 0.5,
        borderBottomColor: Color.lightGrey,
        gap: 5,
    },
    textStyle: {
        width: '70%',

        gap: 10,
    },
})

export default CountrySelectorModal

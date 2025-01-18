import React, { memo, useState } from 'react'
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

const VehicleCommonModal = ({
    visible,
    setVisible,
    onSelect,
    data,
    title,
    isPaint,
}) => {
    const [selectedItem, setSelectedItem] = useState(null)

    // Generate years from 1980 to 2030
    //   const years = Array.from({ length: 2030 - 1980 + 1 }, (_, i) => ({
    //     id: (1980 + i).toString(),
    //     name: (1980 + i).toString(),
    //   }));

    const handleSelect = (item) => {
        setSelectedItem(item.id)
        onSelect(item) // Passing the selected item to onSelect prop
        setVisible(false)
    }

    const renderItem = ({ item }) => {
        const isSelected = selectedItem === item.id
        return (
            <TouchableOpacity
                style={styles.item}
                onPress={() => handleSelect(item)}
            >
                <View
                    style={[
                        styles.dot,
                        isPaint && { backgroundColor: item?.colorCode },
                    ]}
                />
                <Spacing type={'h'} val={20} />
                <Text
                    style={[
                        Style.flex1,
                        Style.fontBold,
                        Style.label,
                        Style.colorBlack,
                    ]}
                >
                    {item?.name}
                </Text>
                <View
                    style={
                        isSelected ? styles.checkboxSelected : styles.checkbox
                    }
                >
                    {isSelected && <Text style={styles?.tick}>✓</Text>}
                </View>
            </TouchableOpacity>
        )
    }

    return (
        <Modal
            transparent={true}
            visible={visible}
            animationType='slide'
            onRequestClose={() => setVisible(false)}
        >
            <Pressable
                onPress={() => setVisible(false)}
                style={styles.modalContainer}
            >
                <View style={styles.modalContent}>
                    <Spacing val={15} />
                    <Text
                        style={[
                            Style.fontBold,
                            Style.label,
                            Style.colorBlack,
                            Style.textCenter,
                        ]}
                    >
                        {title ?? ''}
                    </Text>
                    <Spacing val={15} />
                    <FlatList
                        data={data}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={renderItem}
                    />
                </View>
            </Pressable>
        </Modal>
    )
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        marginHorizontal: 20,
        padding: 10,
        borderRadius: 10,
        width: '100%',
        height: 400,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderColor: '#ddd',
    },
    checkbox: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxSelected: {
        width: 24,
        height: 24,
        backgroundColor: 'green',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tick: {
        color: 'white',
        fontWeight: 'bold',
    },
    dot: {
        height: 15,
        width: 15,
        backgroundColor: Color.gray,
        borderRadius: 100,
    },
})

export default memo(VehicleCommonModal)

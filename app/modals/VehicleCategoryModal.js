import React, { memo, useState } from 'react'
import {
    Modal,
    View,
    Text,
    FlatList,
    Image,
    TouchableOpacity,
    StyleSheet,
    Pressable,
} from 'react-native'
import Style from '../utils/Styles'
import Spacing from '../components/Spacing'
import Color from '../utils/Color'
import { all } from 'axios'

const VehicleCategoryModal = ({ visible, setVisible, onSelect,allVehicles }) => {
    const [selectedItem, setSelectedItem] = useState(null)
    console.log('=====cars====', allVehicles)
    const vehicles = [
        { id: '1', name: 'Moto', image: require('../assets/bike.png') },
        {
            id: '2',
            name: 'Ride Mini',
            image: require('../assets/ridemini.png'),
        },
        { id: '3', name: 'Ride', image: require('../assets/ride.png') },
        { id: '4', name: 'Ride A/C', image: require('../assets/car.png') },
    ]

    const handleSelect = (item) => {
        setSelectedItem(item.id)
        onSelect(item) // Passing the selected item to onSelect prop
        setVisible(false)
    }

    const renderItem = ({ item }) => {
        const image = item?.ride_img.replace('..','https://appserver.txy.co')
        // 'https://appserver.txy.co/img/ride_imgs/db81eb1426b30f8b61ae506707b083db.png
        const isSelected = selectedItem === item.id
        return (
            <TouchableOpacity
                style={styles.item}
                onPress={() => handleSelect(item)}
            >
                <Image source={{uri:item?.image ?? image}} style={styles.image} />
                <Text
                    style={[
                        Style.flex1,
                        Style.fontMedium,
                        Style.label,
                        Style.colorBlack,
                    ]}
                >
                    {item?.ride_type}
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
                        Vehicle Categories
                    </Text>
                    <Spacing val={15} />
                    <FlatList
                        data={allVehicles}
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
        height:400
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderColor: '#ddd',
    },
    image: {
        width: 60,
        height: 60,
        marginRight: 15,
        objectFit: 'contain',
    },
    name: {
        flex: 1,
        fontSize: 16,
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
    closeButton: {
        marginTop: 20,
        alignSelf: 'center',
        padding: 10,
        backgroundColor: '#007BFF',
        borderRadius: 5,
    },
    closeText: {
        color: 'white',
        fontWeight: 'bold',
    },
})

export default memo(VehicleCategoryModal)

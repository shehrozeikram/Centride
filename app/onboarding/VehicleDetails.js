import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Platform,
    ScrollView,
    Image,
} from 'react-native'
import React, { useEffect, useState } from 'react'
import Style from '../utils/Styles'
import { useNavigation, useRoute } from '@react-navigation/native'
import OnBoardingScreenLoader from './component/OnboardingLoader'
import Spacing from '../components/Spacing'
import AppButton from '../components/AppButton'
import InputField from '../components/InputField'
import Color from '../utils/Color'
import Header from '../components/Header'
import {
    DRIVER,
    citiesInPakistan,
    colorCodes,
    getAppSide,
    setSessionId,
} from '../utils/common'
import DriverCostDetails from '../components/DriverCostDetails'
import VehicleCategoryModal from '../modals/VehicleCategoryModal'
import VehicleCommonModal from '../modals/VehicleModalYear'
import moto from '../assets/bike.png'
import rideme from '../assets/ridemini.png'
import ride from '../assets/ride.png'
import rideAc from '../assets/car.png'
import { Post } from '../network/network'
const VehicleDetails = () => {
    const vehicelImages = {
        bicke: 'https://immediad.com/wp-content/uploads/2022/05/194-1945076_super-bike-png-bike-images-free-download-searchpng.png',
    }
    const navigation = useNavigation()
    const [selectServiceCity, setSelectServiceCity] = useState('')
    const [selectVehicleCategory, setSelectVehicleCategory] = useState('')
    const [vehicleModle, setVehicleModal] = useState('')
    const [vehicleModleYear, setVehicleModalYear] = useState('')
    const [vehiclePlateNumber, setVehiclePlateNumber] = useState('')
    const [vehicleColor, setVehicleColor] = useState('')
    const [selectedVehichicle, setSelectedVehicleImage] = useState(moto)

    //modals states
    const [IsVehicleCatModal, setIsVehicleCatModa] = useState(false)
    const [IsVehicleYearModal, setIsVehicleYearModal] = useState(false)
    const [IsCitesModal, setIsCitesModal] = useState(false)
    const [isColorModal, setIColorModal] = useState(false)
    const [routeValues, setRouteValues] = useState('') // State to store OTP
    const route = useRoute()

    const [cites, setCites] = useState([])
    const [operationalCity, setOperationalCity] = useState('')
    const [result, setResult] = useState([])
    const [carsArray, setCarsArray] = useState([])
    const [costData, setCostData] = useState({})

    useEffect(() => {
        handleRoute()
    }, [route?.params])
    const handleRoute = () => {
        console.log('======route?.params====', route?.params)
        if (route?.params) {
            setRouteValues(route?.params?.data)
        }
    }
    useEffect(() => {
        // deleteSessionId()
        getSession()
    }, [])
    useEffect(() => {
        getCarsData(operationalCity)
    }, [operationalCity])
    const getSession = async () => {
        const firstData = {
            action: 'checkDriverLoginStatus',
            timezone: 'Asia/Karachi',
            platform: Platform.OS,
            display_lang: 'en',
        }
        console.log('firstData', firstData)
        Post({
            data: firstData,
        })
            .then((firstResponse) => {
                // const jsonData = JSON.stringify(firstResponse);

                const cityIdArray = [
                    ...firstResponse?.tariff_data?.result?.city_id,
                ]
                const citiesInPakistan =
                    Array.isArray(
                        firstResponse?.tariff_data?.result?.city_name,
                    ) &&
                    firstResponse?.tariff_data?.result?.city_name.map(
                        (city, index) => ({
                            id: (index + 1).toString(), // Create a string id starting from 1
                            name: city
                                .replace(/ Tariff$/, '')
                                .replace(/ \(.+\)$/, '')
                                .trim(),
                            city_id: cityIdArray[index],
                        }),
                    )
                console.log('citiesInPakistan', citiesInPakistan)
                setCites(citiesInPakistan)
                setResult(firstResponse?.tariff_data?.result)

                const sess_id = firstResponse?.sess_id

                setSessionId(sess_id) //async
            })

            .catch((error) => {
                console.error('Error:', error)
                Alert.alert('Error', 'An error occurred. Please try again.')
            })
    }
    const getCarsData = (cityId) => {
        const cars = result[cityId]?.cars || [] // Use optional chaining to avoid errors
     
        setCarsArray(cars)
    }
  
  

    const onPressButton = async () => {
        const appSide = await getAppSide()
        const data = {
            ...routeValues,
            vehicleColor,
            vehicleModleYear,
            vehicleModle,
            vehiclePlateNumber,
            selectVehicleCategory,
            operationalCity,
        }
        appSide === DRIVER
            ? navigation.navigate('CreatePasswordScreen', { data })
            : navigation.navigate('AlmostDone')
    }

    const onBackPress = () => {
        navigation.goBack()
    }
    const years = Array.from({ length: 2030 - 1980 + 1 }, (_, i) => ({
        id: (1980 + i).toString(),
        name: (1980 + i).toString(),
    }))
    const handleVehicleImages = (item) => {
        const image = item?.ride_img.replace('..','https://appserver.txy.co')
        console.log(
            '====================================car item===========',
            item,
        )
        setSelectedVehicleImage(image)
        setCostData({
            cost_per_km:item?.cost_per_km,
            cost_per_minute:item?.cost_per_minute,
            minimum_price:item?.ncost_per_km,
            num_seats:item?.num_seats
            
        })
        return
        const imageMapping = {
            Moto: moto,
            'Ride Mini': rideme,
            Ride: ride,
            'Ride A/C': rideAc,
        }

        const selectedImage = imageMapping[item?.name]
        if (selectedImage) {
            setSelectedVehicleImage(selectedImage)
        }
    }

    return (
        <View style={[Style.container, Style.hPaddingSixteen]}>
            <Spacing val={Platform.OS === 'ios' && 35} />
            <Header LeftIcon={true} onPressLeftIcon={onBackPress} />
            <Spacing val={25} />
            <View style={[Style.widthFull]}>
                <OnBoardingScreenLoader position={[0, 1, 2]} />
            </View>

            <Spacing val={30} />
            <Text style={[Style.fontBold, Style.labelButton, Style.colorBlack]}>
                Vehicle Details
            </Text>
            <Spacing val={10} />
            <Text style={[Style.fontMedium, Style.label14, Style.colorBlack]}>
                Tell us more about your vehicle
            </Text>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={[Style.justifyStart, Style.flex1]}>
                    <Spacing val={30} />
                    <Image
                        style={[styles.vehicleImages, Style.selfAlignCenter]}
                        source={{uri:selectedVehichicle}}
                    />
                    <Spacing val={20} />
                    <DriverCostDetails
                        leftText={'Minimum price'}
                        rightText={costData?.minimum_price}
                    />
                    <Spacing val={10} />
                    <DriverCostDetails
                        leftText={'Cost per Km'}
                        rightText={costData?.cost_per_km}
                    />
                    <Spacing val={10} />
                    <DriverCostDetails
                        leftText={'Cost per minute'}
                        rightText={costData?.cost_per_minute}
                    />
                    <Spacing val={20} />
                    <DriverCostDetails leftText={'Seating'} rightText={costData?.num_seats} />
                    <Spacing val={20} />
                    <InputField
                        value={selectServiceCity}
                        onChangeText={setSelectServiceCity}
                        error={''}
                        label={'Select Service City'}
                        placeholder={'Select Service Cit'}
                        editable={false}
                        onPress={() => {
                            setIsCitesModal(true)
                        }}
                    />
                    <Spacing val={10} />
                    <InputField
                        value={selectVehicleCategory}
                        onChangeText={setSelectVehicleCategory}
                        error={''}
                        label={'vehicle category'}
                        placeholder={'vehicle category'}
                        editable={false}
                        onPress={() => {
                            setIsVehicleCatModa(true)
                        }}
                    />

                    <Spacing val={10} />
                    <InputField
                        value={vehicleModle}
                        onChangeText={setVehicleModal}
                        error={''}
                        label={'Vehicle modal'}
                        placeholder={'Vehicle modal'}
                    />
                    <Spacing val={10} />
                    <InputField
                        value={vehicleModleYear}
                        onChangeText={setVehicleModalYear}
                        error={''}
                        label={'Vehicle modal year'}
                        placeholder={'Vehicle modal year'}
                        editable={false}
                        onPress={() => {
                            setIsVehicleYearModal(true)
                        }}
                    />
                    <Spacing val={10} />
                    <InputField
                        value={vehiclePlateNumber}
                        onChangeText={setVehiclePlateNumber}
                        error={''}
                        label={'Vehicle plate number'}
                        placeholder={'Vehicle plate numbe'}
                    />
                    <Spacing val={10} />
                    <InputField
                        value={vehicleColor}
                        onChangeText={setVehicleColor}
                        error={''}
                        label={'Vehicle paint color'}
                        placeholder={'Vehicle paint color'}
                        editable={false}
                        onPress={() => {
                            setIColorModal(true)
                        }}
                    />
                    {/* Checkbox section */}
                </View>
                <Spacing val={100} />
            </ScrollView>

            {/* <View style={[Style.flex1, Style.justifyEnd]}> */}
            <AppButton onPress={onPressButton} name={'Continue'} />

            {/* </View> */}
            <Spacing val={40} />

            <VehicleCategoryModal
                visible={IsVehicleCatModal}
                setVisible={setIsVehicleCatModa}
                onSelect={(item) => {
                    console.log('CAT', item)
                    setSelectVehicleCategory(item?.ride_type)
                    handleVehicleImages(item)
                }}
                allVehicles={carsArray}
            />
            <VehicleCommonModal
                title={'Select Year'}
                visible={IsVehicleYearModal}
                setVisible={setIsVehicleYearModal}
                onSelect={(item) => {
                    console.log('CAT', item)
                    setVehicleModalYear(item?.name)
                }}
                data={years}
            />
            <VehicleCommonModal
                title={'Select Service City'}
                visible={IsCitesModal}
                setVisible={setIsCitesModal}
                onSelect={(item) => {
                    console.log('CAT', item)
                    setSelectServiceCity(item?.name)
                    setOperationalCity(item?.city_id)
                }}
                // data={citiesInPakistan}
                data={cites}
            />
            <VehicleCommonModal
                title={'Select Vehicle Color'}
                visible={isColorModal}
                setVisible={setIColorModal}
                onSelect={(item) => {
                    console.log('CAT', item)
                    setVehicleColor(item?.name)
                }}
                data={colorCodes}
                isPaint={true}
            />
        </View>
    )
}

export default VehicleDetails

const styles = StyleSheet.create({
    vehicleImages: {
        height: 100,
        width: 150,
        objectFit: 'contain',
        backgroundColor: Color.white,
    },
})

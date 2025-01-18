import React from 'react'
import { StyleSheet, View, Text } from 'react-native'
import { LineChart } from 'react-native-chart-kit'
import Header from '../../components/Header'
import { useNavigation } from '@react-navigation/native'

const Earnings = () => {
    // Static data for earnings over a week
    const data = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
            {
                data: [80, 120, 150, 90, 200, 300, 250], // Static earnings data
                strokeWidth: 2, // optional
            },
        ],
    }

    const navigation = useNavigation()

    const onBackPress = () => {
        navigation.goBack()
    }

    return (
        <View style={styles.container}>
            <Spacing val={Platform.OS === 'ios' && 35} />
            {/* <Header LeftIcon={true} onPressLeftIcon={onBackPress} /> */}
            {/* <Spacing val={35} /> */}
            {/* <Text style={styles.title}>Driver Earnings</Text> */}
            <LineChart
                data={data}
                width={350}
                height={220}
                yAxisLabel=''
                yAxisSuffix=''
                yAxisInterval={1} // optional, defaults to 1
                chartConfig={{
                    backgroundColor: '#ffffff',
                    backgroundGradientFrom: '#ffffff',
                    backgroundGradientTo: '#ffffff',
                    decimalPlaces: 2, // optional, defaults to 2
                    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    style: {
                        borderRadius: 16,
                    },
                    propsForDots: {
                        r: '6',
                        strokeWidth: '2',
                        stroke: '#ffa726',
                    },
                }}
                bezier
                style={{
                    marginVertical: 8,
                    borderRadius: 16,
                }}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#f9f9f9',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
})

export default Earnings

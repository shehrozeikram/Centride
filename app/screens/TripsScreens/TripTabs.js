import React, {
    memo,
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from 'react'

import {
    Dimensions,
    FlatList,
    I18nManager,
    StyleSheet,
    Text as TextBold,
    TouchableOpacity,
    View,
} from 'react-native'

import Style from '../../utils/Styles'
import Current from './Current'
import Completed from './Completed'
import Cancelled from './Cancelled'
import Color from '../../utils/Color'

const { width } = Dimensions.get('window')

const TripTabs = ({ cancelBooking, completeBookings, currentBookings }) => {
    const [active, setActive] = useState(0)
    const headerScrollView = useRef(null)
    const itemScrollView = useRef(null)

    const [tabsData, setTabsData] = useState()

    console.log('=====currentBookings=====', currentBookings)

    const componentsList = useMemo(
        () => [
            { type: 'Current', title: 'Component A' },
            // { type: 'batch', title: 'Component B' },
            // { type: 'focusses', title: 'Component C' },
            { type: 'Completed', title: 'Component D' },
            { type: 'Cancelled', title: 'Component E' },
        ],
        [],
    )

    useLayoutEffect(() => {
        componentsInitialScrollTo()
    }, [])

    useEffect(() => {
        headerScrolls()
    }, [active])

    const headerScrolls = () => {
        headerScrollView.current.scrollToIndex({
            index: active,
            viewPosition: 0.5,
        })
    }

    const componentsInitialScrollTo = () => {
        setTimeout(() => {
            itemScrollView.current?.scrollToIndex({
                index: 0,
                animated: true,
                viewPosition: 0.5,
            })
        }, 200)
    }

    const onPressHeader = (index) => {
        if (active !== index) {
            itemScrollView.current.scrollToIndex({ index })
            setActive(index)
        }
    }

    const onScroll = useCallback(
        (e) => {
            const x = e.nativeEvent.contentOffset.x
            let newIndex = Math.floor(x / width + 0.5)
            if (active !== newIndex) {
                setActive(newIndex)
            }
        },
        [active],
    )
    const headers = useMemo(() => ['Current', 'Completed', 'Cancelled'], [])

    const renderComponent = useCallback(
        (componentType, title, isActive) => {
            if (!isActive) return null
            switch (componentType) {
                case 'Current':
                    return <Current data={currentBookings} />

                case 'Completed':
                    return <Completed data={completeBookings} />
                case 'Cancelled':
                    return <Cancelled data={cancelBooking} />

                default:
                    return <View></View>
            }
        },
        [active, cancelBooking, completeBookings, currentBookings],
    )

    const renderHeaderItem = useCallback(
        ({ item, index }) => (
            <View style={[Style.alignStart]}>
                <TouchableOpacity
                    onPress={() => onPressHeader(index)}
                    key={item}
                    style={[
                        styles.headerItem,
                        active === index ? styles.isActiv : styles.notActive,
                    ]}>
                    <TextBold
                        style={[
                            Style.label,
                            active === index
                                ? Style.colorPrimary
                                : Style.colorBlack,
                        ]}>
                        {item}
                    </TextBold>
                </TouchableOpacity>
            </View>
        ),
        [active, cancelBooking, completeBookings, currentBookings],
    )

    const renderItem = useCallback(
        ({ item, index }) => (
            <View style={{ width: width }}>
                {renderComponent(item.type, item.title, active === index)}
            </View>
        ),
        [active, cancelBooking, completeBookings, currentBookings],
    )

    return (
        <View style={styles.container}>
            <FlatList
                scrollEnabled={true}
                data={headers}
                ref={headerScrollView}
                keyExtractor={(item) => item}
                horizontal
                decelerationRate='fast'
                style={styles.headerScroll}
                inverted={I18nManager.isRTL}
                contentContainerStyle={{
                    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
                    justifyContent: 'space-between',
                    width: '100%',
                }}
                showsHorizontalScrollIndicator={false}
                renderItem={renderHeaderItem} // Using renderHeaderItem here
            />
            <FlatList
                data={componentsList}
                ref={itemScrollView}
                keyExtractor={(item) => item.title}
                horizontal
                pagingEnabled
                decelerationRate='fast'
                showsHorizontalScrollIndicator={false}
                onScroll={onScroll}
                renderItem={renderItem}
                inverted={I18nManager.isRTL}
                contentContainerStyle={{
                    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
                }}
                removeClippedSubviews={true}
            />
        </View>
    )
}

export default memo(TripTabs)

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'flex-start',
    },
    headerScroll: {
        flexGrow: 0,
    },
    headerItem: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        paddingVertical: 8,

        width: '100%',
    },
    isActiv: {
        borderBottomWidth: 1,
        borderBlockColor: Color.primary,
    },
    notActive: {
        borderBottomWidth: 1,
        borderBlockColor: Color.inputBackground,
    },
})

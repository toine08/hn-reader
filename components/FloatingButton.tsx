import React from 'react';
import { TouchableOpacity, Text, View} from 'react-native';

const FloatingButton = (props: any) => {
    return (
        <TouchableOpacity className="flex-1 items-center justify-center bg-red">
            <View>
            <Text className='text-white font-bold text-lg'>Filter</Text>
            </View>
        </TouchableOpacity>
    );
};
export default FloatingButton;

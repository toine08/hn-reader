import React from 'react';
import { TouchableOpacity, Text} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const FloatingButton = (props: any) => {
    return (
        <TouchableOpacity
        {...props}
        className="bg-blue-500 rounded-full p-3 flex items-center justify-center w-12 h-12 shadow-lg"
      >
        <FontAwesome name="filter" size={24} color="white" />
      </TouchableOpacity>
    );
};
export default FloatingButton;

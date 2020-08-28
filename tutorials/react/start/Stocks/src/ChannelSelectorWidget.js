import React from 'react';
import chroma from 'chroma-js';
import Select from 'react-select';

// The value that will be displayed inside the channel selector widget to leave the current channel.
import { NO_CHANNEL_VALUE } from './constants';

// The CSS for the color dot that will appear next to each item inside the channel selector widget menu.
const dot = (color = '#ccc') => ({
    alignItems: 'center',
    display: 'flex',

    ':before': {
        backgroundColor: color,
        borderRadius: 10,
        content: '" "',
        display: 'block',
        marginRight: 8,
        height: 10,
        width: 10
    }
});

// The CSS for the different UI components of the channel selector widget.
const colourStyles = {
    container: styles => ({ ...styles, width: '148px' }),
    control: styles => ({ ...styles, backgroundColor: 'white' }),
    option: (styles, { data, isDisabled, isFocused, isSelected }) => {
        const color = chroma(data.color || '#E4E5E9');
        return {
            ...styles,
            backgroundColor: isDisabled
                ? null
                : isSelected
                    ? data.color
                    : isFocused
                        ? color.alpha(0.1).css()
                        : null,
            color: isDisabled
                ? '#ccc'
                : isSelected
                    ? chroma.contrast(color, 'white') > 2
                        ? 'white'
                        : 'black'
                    : data.color,
            cursor: isDisabled ? 'not-allowed' : 'default',
            width: '148px',
            ':active': {
                ...styles[':active'],
                backgroundColor: !isDisabled && (isSelected ? data.color : color.alpha(0.3).css()),
            },
        };
    },
    input: styles => ({ ...styles, ...dot() }),
    placeholder: styles => ({ ...styles, ...dot() }),
    singleValue: (styles, { data }) => ({ ...styles, ...dot(data.color) })
};

function ChannelSelectorWidget({ channelNamesAndColors = [], onChannelSelected = () => {}, onDefaultChannelSelected = () => {}, startingChannel }) {
    // The default channel that will always be part of the channel selector widget.
    const defaultChannel = {
        value: NO_CHANNEL_VALUE,
        label: NO_CHANNEL_VALUE
    };
    
    if (startingChannel) {
        defaultChannel.value = startingChannel;
        defaultChannel.label = startingChannel;
    }

    const options = [
        defaultChannel,
        ...channelNamesAndColors.map(({ name, color }) => ({
            value: name,
            label: name,
            color
        }))
    ];

    const onChange = target => {
        if (target.value === NO_CHANNEL_VALUE) onDefaultChannelSelected(target);
        else onChannelSelected(target);
    };

    return (
        <Select
            defaultValue={defaultChannel}
            options={options}
            styles={colourStyles}
            onChange={onChange}
            isSearchable={false}
        />
    );
}

export default ChannelSelectorWidget;

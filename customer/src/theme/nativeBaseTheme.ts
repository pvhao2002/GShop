import { extendTheme } from 'native-base';

export const lightTheme = extendTheme({
  colors: {
    primary: {
      50: '#E3F2FD',
      100: '#BBDEFB',
      200: '#90CAF9',
      300: '#64B5F6',
      400: '#42A5F5',
      500: '#007AFF',
      600: '#1E88E5',
      700: '#1976D2',
      800: '#1565C0',
      900: '#0D47A1',
    },
    secondary: {
      50: '#F3E5F5',
      100: '#E1BEE7',
      200: '#CE93D8',
      300: '#BA68C8',
      400: '#AB47BC',
      500: '#5856D6',
      600: '#8E24AA',
      700: '#7B1FA2',
      800: '#6A1B9A',
      900: '#4A148C',
    },
    success: {
      50: '#E8F5E8',
      100: '#C8E6C9',
      200: '#A5D6A7',
      300: '#81C784',
      400: '#66BB6A',
      500: '#34C759',
      600: '#43A047',
      700: '#388E3C',
      800: '#2E7D32',
      900: '#1B5E20',
    },
    warning: {
      50: '#FFF8E1',
      100: '#FFECB3',
      200: '#FFE082',
      300: '#FFD54F',
      400: '#FFCA28',
      500: '#FF9500',
      600: '#FFB300',
      700: '#FFA000',
      800: '#FF8F00',
      900: '#FF6F00',
    },
    error: {
      50: '#FFEBEE',
      100: '#FFCDD2',
      200: '#EF9A9A',
      300: '#E57373',
      400: '#EF5350',
      500: '#FF3B30',
      600: '#E53935',
      700: '#D32F2F',
      800: '#C62828',
      900: '#B71C1C',
    },
  },
  config: {
    useSystemColorMode: false,
    initialColorMode: 'light',
  },
  components: {
    Button: {
      baseStyle: {
        borderRadius: 8,
        _text: {
          fontWeight: '600',
        },
      },
      variants: {
        solid: {
          bg: 'primary.500',
          _pressed: {
            bg: 'primary.600',
          },
        },
        outline: {
          borderColor: 'primary.500',
          borderWidth: 1,
          bg: 'transparent',
          _text: {
            color: 'primary.500',
          },
          _pressed: {
            bg: 'primary.50',
          },
        },
      },
      sizes: {
        sm: {
          px: 3,
          py: 2,
          _text: {
            fontSize: 'sm',
          },
        },
        md: {
          px: 4,
          py: 3,
          _text: {
            fontSize: 'md',
          },
        },
        lg: {
          px: 6,
          py: 4,
          _text: {
            fontSize: 'lg',
          },
        },
      },
    },
    Input: {
      baseStyle: {
        borderRadius: 8,
        borderColor: 'gray.300',
        _focus: {
          borderColor: 'primary.500',
          bg: 'white',
        },
      },
    },
    Card: {
      baseStyle: {
        bg: 'white',
        borderRadius: 12,
        shadow: 2,
        p: 4,
      },
    },
  },
});

export const darkTheme = extendTheme({
  colors: {
    primary: {
      50: '#E3F2FD',
      100: '#BBDEFB',
      200: '#90CAF9',
      300: '#64B5F6',
      400: '#42A5F5',
      500: '#0A84FF',
      600: '#1E88E5',
      700: '#1976D2',
      800: '#1565C0',
      900: '#0D47A1',
    },
    secondary: {
      50: '#F3E5F5',
      100: '#E1BEE7',
      200: '#CE93D8',
      300: '#BA68C8',
      400: '#AB47BC',
      500: '#5E5CE6',
      600: '#8E24AA',
      700: '#7B1FA2',
      800: '#6A1B9A',
      900: '#4A148C',
    },
    success: {
      50: '#E8F5E8',
      100: '#C8E6C9',
      200: '#A5D6A7',
      300: '#81C784',
      400: '#66BB6A',
      500: '#30D158',
      600: '#43A047',
      700: '#388E3C',
      800: '#2E7D32',
      900: '#1B5E20',
    },
    warning: {
      50: '#FFF8E1',
      100: '#FFECB3',
      200: '#FFE082',
      300: '#FFD54F',
      400: '#FFCA28',
      500: '#FF9F0A',
      600: '#FFB300',
      700: '#FFA000',
      800: '#FF8F00',
      900: '#FF6F00',
    },
    error: {
      50: '#FFEBEE',
      100: '#FFCDD2',
      200: '#EF9A9A',
      300: '#E57373',
      400: '#EF5350',
      500: '#FF453A',
      600: '#E53935',
      700: '#D32F2F',
      800: '#C62828',
      900: '#B71C1C',
    },
  },
  config: {
    useSystemColorMode: false,
    initialColorMode: 'dark',
  },
  components: {
    Button: {
      baseStyle: {
        borderRadius: 8,
        _text: {
          fontWeight: '600',
        },
      },
      variants: {
        solid: {
          bg: 'primary.500',
          _pressed: {
            bg: 'primary.600',
          },
        },
        outline: {
          borderColor: 'primary.500',
          borderWidth: 1,
          bg: 'transparent',
          _text: {
            color: 'primary.500',
          },
          _pressed: {
            bg: 'primary.900',
          },
        },
      },
    },
    Input: {
      baseStyle: {
        borderRadius: 8,
        borderColor: 'gray.600',
        bg: 'gray.800',
        color: 'white',
        _focus: {
          borderColor: 'primary.500',
          bg: 'gray.700',
        },
      },
    },
    Card: {
      baseStyle: {
        bg: 'gray.800',
        borderRadius: 12,
        shadow: 2,
        p: 4,
      },
    },
  },
});
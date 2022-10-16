module.exports = {
  content: ["./app/**/*.{ts,tsx,jsx,js}"],
  theme: {
    fontFamily: {
      'main': ['Poppins', 'sans-serif'],
    },
    extend: {
      maxWidth: {
        '3/4': '75%',
      },
      animation: {
        'pulse-custom': 'pulse-custom 3s ease-in-out infinite'
      },
      keyframes: {
        ripple: {
          from: {
            opacity: 1,
            transform: 'scale3d(0.75,0.75,1)'
          },
          to: {
            opacity: 0,
            transform: 'scale3d(1.5,1.5,1)'
          }
        },
        'pulse-custom': {
          '0%,100%': {
            transform: 'scale3d(0.98, 0.98, 1)'
          },
          '30%': {
            transform: 'scale3d(1.02, 1.02,1)'
          },
          '50%': {
            transform: 'scale3d(0.98, 0.98,1)'
          },
          '90%': {
            transform: 'scale3d(1.02, 1.02,1)'
          }
        }
      }
    }
  },
  plugins: [],
}

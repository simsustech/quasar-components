export default function ({ mode, command }) {
  return {
    vitrify: {
      lang: 'nl',
      hooks: {
        // Vitrify hooks
      },
      globalCss: [
        '@simsustech/quasar-components/css'
      ],
      sass: {
        variables: {
          $primary: '#000000'
        }
      }
    },
    quasar: {
      extras: ['material-icons'],
      framework: {
        components: [
          // Deprecated
        ],
        plugins: ['Dialog']
      }
    }
  }
}

{
  auth: {
    _login: {
      loading: false,
      error: null
    },
    authData: null
  },

  home: {
    _create: {
      loading: false,
      error: null
      name: null,
      title: null,
    },
    name: string (english),
    title: string (any),
  },

  join: {
    name: string (english),
    title: string (any),
  },

  question: {
    questionData: {
      name: String,
      title: String (subject to change),
      owner: 'unique-user-string',
      valid: boolean,
      startTime: datetime,
      duration: null (inf) | seconds,
      labels: ['morning', 'afternoon', 'evening'],

      structure: {
        'date-number': {
          // number: 0-6
          // date - string
          date: number | datetime,
          // default values
          periods: [0,0,0]
        },
      },

      participants: {
        'unique-user-string': {
          votes: {
            'date-number': {
              peroids: [0, 0, 0]
            },
            'date-number': {
              peroids: [0, 2, 1]
            }
          }
        }
      }
    },

    vote: {
      'date-number': {
        // number: 0-6
        // date - string
        date: number | datetime,
        // default values
        periods: [0,0,0]
      },
    },

    score: {
      'date-number': {
        date: ..., ?
        period: [0.25, 0.11, 1.58]
      },
    },

  }

}

{
  users: {
    'unique-user-string': {
      provider: 'facebook',
      name: String
    }
  },

  questions: {
    'unique-question-name': {
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
    }
  }
};

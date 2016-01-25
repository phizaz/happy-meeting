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

  voting: {
    calendar: [
      {
        date: ..., ?
        period: [0,0,0] (0-2)
      },
    ],

    score: [
      {
        date: ..., ?
        period: [0.25, 0.11, 1.58]
      },
    ],

  }

}

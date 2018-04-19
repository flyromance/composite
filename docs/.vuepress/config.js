module.exports = {
  title: 'Hello VuePress',
  description: 'Just playing around',
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide' },
      { text: 'External', link: 'https://google.com' },
    ],
    // sidebar: [
    //   ['/', 'index page'],
    //   '/guide',
    //   ['/test', 'test'],
    //   {
    //     title: 'Group 2',
    //     collapsable: false,
    //     children: [
    //         ['/foo/aaa', 'page']
    //     ]
    //   }
    // ],
    sidebar: {
      // sidebar for pages under /foo/
      '/foo/': [
        // '',
        'aaa',
      ],
    },
  }
}

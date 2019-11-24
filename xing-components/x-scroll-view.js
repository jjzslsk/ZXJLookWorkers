// components/xing/x-scroll-view/x-scroll-view.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    pullText: {
      type: String,
      value: '下拉刷新',
    },
    releaseText: {
      type: String,
      value: '松开刷新',
    },
    loadingText: {//加载数据
      type: String,
      value: '加载中...',
    },
    finishText: {
      type: String,
      value: '刷新完成',
    },
    loadmoreText: {//加载数据
      type: String,
      value: '加载中...',
    },
    nomoreText: {
      type: String,
      value: '加载完毕',
    },
    pullDownHeight: {
      type: Number,
      value: 60,
    },
    refreshing: {
      type: Boolean,
      value: false,
      observer: '_onRefreshFinished',
    },
    nomore: {
      type: Boolean,
      value: false,
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    topNum: 0,
    pullDownStatus: 0,
    lastScrollEnd: 0,
  },

  /**
   * 组件的方法列表
   */
  methods: {

      // 获取滚动条当前位置
  scrolltoupper:function(e){
    console.log(e)
    if (e.detail.scrollTop > 100) {
      this.setData({
        floorstatus: true
      });
    } else {
      this.setData({
        floorstatus: false
      });
    }
  },

  //回到顶部
  goTop: function (e) { // 一键回到顶部
    this.setData({
      topNum: this.data.topNum = 0
    });
  },

    _onScroll: function (e) {
      this.triggerEvent('scroll', e.detail);
      const status = this.data.pullDownStatus;
      if (status === 3 || status == 4) return;
      const height = this.properties.pullDownHeight;
      const scrollTop = e.detail.scrollTop;
      let targetStatus;
      if (scrollTop < -1 * height) {
        targetStatus = 2;
      } else if (scrollTop < 0) {
        targetStatus = 1;
      } else {
        targetStatus = 0;
      }
      if (status != targetStatus) {
        this.setData({
          pullDownStatus: targetStatus,
        })
      }

      //回到顶部
    if (e.detail.scrollTop > 100) {
      this.setData({
        floorstatus: true
      });
    } else {
      this.setData({
        floorstatus: false
      });
    }


    },

    _onTouchEnd: function (e) {
      const status = this.data.pullDownStatus;
      if (status === 2) {
        this.setData({
          pullDownStatus: 3,
        })
        this.properties.refreshing = true;
        setTimeout(() => {
          this.triggerEvent('pulldownrefresh');
        }, 400);
      }
    },

    _onRefreshFinished(newVal, oldVal) {
      if (oldVal === true && newVal === false) {
        this.properties.nomore = false;
        this.setData({
          nomore: false,
        })
        this.setData({
          pullDownStatus: 4,
          lastScrollEnd: 0,
        })
        setTimeout(() => {
          this.setData({
            pullDownStatus: 0,
          })
        }, 400);
      }
    },

    _onLoadmore() {
      if (!this.properties.nomore) {
        let query = wx.createSelectorQuery().in(this);
        query.select('.scroll-view').fields({
          size: true,
          scrollOffset: true,
        }, res => {
          if (Math.abs(res.scrollTop - this.data.lastScrollEnd) > res.height) {
            this.setData({
              lastScrollEnd: res.scrollTop,
            })
            this.triggerEvent('loadmore');
          }
        }).exec();
      }
    },
  },
})



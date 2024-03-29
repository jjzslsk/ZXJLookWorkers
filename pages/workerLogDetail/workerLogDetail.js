// pages/workerLogDetail/workerLogDetail.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    lid:'',
    id: '',
    name: '',
    detail:'',
    content:'',
    cmtPlaceholder:'请输入评论内容',
    openCmt:false,
    cmtList:[],
    isLike:'0'
  },

  previewImage: function (e) {
    var i = e.currentTarget.dataset.i
    var pickedImgs = this.data.detail.imgs
    wx.previewImage({
      current: pickedImgs[i], // 当前显示图片的http链接
      urls: pickedImgs // 需要预览的图片http链接列表
    })
  },

  openCmt: function (e) {
    this.setData({
      openCmt: true
    })
  },

  hideCmt: function (e) {
    this.setData({
      openCmt: false
    })
  },

  likeTap: function (e) {    
    if (app.globalData.userInfo == undefined || app.globalData.userInfo == null || app.globalData.userInfo == '') {
      wx.showModal({
        title: '提示',
        content: '您未登录，请先登录再操作。是否前往登录？',
        success(res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/bindPhone/bindPhone'
            })
          }
        }
      })
      return
    }

    var isLike = this.data.isLike
    var detail = this.data.detail
    var dznum = detail.DZ_NUM
    if (isLike=='0')
      isLike='1'
    else
      isLike = '0'
      
    var that = this
    var p = 'SUBJECT_ID=' + this.data.lid + '&CLIENT_ID=' + app.globalData.userId +'&OK_NUM=1'
    app.httpsPlatformClass('upNoAndOk', p,
      function (res) {
        if (isLike=='1')
          detail.DZ_NUM=dznum+1
        else
          detail.DZ_NUM = dznum - 1
        that.setData({
          isLike: isLike,
          detail: detail
        });

      },
      function (returnFrom, res) {
        //失败
        wx.hideLoading();
      }
    );
  },

  repostTap: function (e) {
    if (app.globalData.userInfo == undefined || app.globalData.userInfo == null || app.globalData.userInfo == '') {
      wx.showModal({
        title: '提示',
        content: '您未登录，请先登录再操作。是否前往登录？',
        success(res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/bindPhone/bindPhone'
            })
          }
        }
      })
      return
    }

    var that = this
    var p = 'SUBJECT_ID=' + this.data.lid + '&CLIENT_ID=' + app.globalData.userId + '&NO_NUM=1'
    app.httpsPlatformClass('upNoAndOk', p,
      function (res) {
        // that.setData({
        //   bbsList: res.msg
        // });

      },
      function (returnFrom, res) {
        //失败
        wx.hideLoading();
      }
    );
  },

  onInputChange: function (e) {
    var val = e.detail.value
    this.setData({
      content: val
    })
  },

  shareTo: function (e){
    wx.showShareMenu({
      withShareTicket: true
    })
  },

  comment: function (e) {
    if (app.globalData.userInfo == undefined || app.globalData.userInfo == null || app.globalData.userInfo == '') {
      wx.showModal({
        title: '提示',
        content: '您未登录，请先登录再操作。是否前往登录？',
        success(res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/bindPhone/bindPhone'
            })
          }
        }
      })
      return
    }

    var content=this.data.content
    if (content == '' || content.match(/^\s+$/g)) {//判空
      wx.showToast({
        title: '请输入评论内容',
        icon: 'none',
        duration: 2000
      })
      return
    }

    wx.showLoading({
      title: '提交中',
    })

    var that = this
    var p = 'FLAG=1&BBS_ID=1' + '&PARENT_SUBJECT_ID=' + this.data.lid + '&SUBJECT_MEMO=' + content + '&CLIENT_ID=' + app.globalData.userId

    app.httpsPlatformClass('saveSubject', p,
      function (res) {
        wx.hideLoading();
        var msg=JSON.parse(res.msg)
        if (msg.code=='0'){
          that.getCmtList()
          that.hideCmt()
        }

      },
      function (returnFrom, res) {
        //失败
        wx.hideLoading();
      }
    );
  },

  getCmtList: function (){
    var that=this
    var p = 'PARENT_SUBJECT_ID=' + this.data.lid + '&START_POSITION=0' + '&END_POSITION=30'
    app.httpsGetDatByPlatform('bbs_subject_reply_list', 'list', p,
      function (res) {
        for (var i = 0; i < res.msg.length; i++) {
          var name = res.msg[i].CLIENT_NAME.substr(0,1)+'**'
          res.msg[i].showName=name
        }
        that.setData({
          cmtList: res.msg
        });

      },
      function (returnFrom, res) {
        //失败
        wx.hideLoading();
      }
    );
  },

  setViewCount: function (e) {
    var that = this
    var p = 'SUBJECT_ID=' + this.data.lid + '&CLIENT_ID=' + app.globalData.userId + '&BROWSE_NUMBER=1'
    app.httpsPlatformClass('upBbsBrowseNum', p,
      function (res) {
      },
      function (returnFrom, res) {
        //失败
        wx.hideLoading();
      }
    );
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var lid = options.lid//'1909051742009117'//
    var id = options.id//'1907101446022569'//
    var name = options.name

    this.setData({
      lid: lid,
      id: id,
      name: name
    })

    this.setViewCount()

    var that = this
    var p = 'SUBJECT_ID=' + lid + '&CLIENT_ID=' + app.globalData.userId
    app.httpsGetDatByPlatform('bbs_subject_info', 'map', p,
      function (res) {
        var imgs = []
        if (res.msg.IMG_LIST) {
          var IMG_LIST = JSON.parse(res.msg.IMG_LIST)        
          for (var i = 0; i < IMG_LIST.length; i++) {                    
            imgs[i] = IMG_LIST[i].ATT_DOMAIN + IMG_LIST[i].ATT_WEB_URL

            var url = IMG_LIST[i].ATT_WEB_URL.split('mp4')
            if (url.length > 1) {
              res.msg.videoPath = IMG_LIST[i].ATT_DOMAIN + IMG_LIST[i].ATT_WEB_URL
            } 
          }
        }
        res.msg.imgs = imgs

        that.setData({
          detail: res.msg,
          isLike: res.msg.ZAN_FLAG
        });

      },
      function (returnFrom, res) {
        //失败
        wx.hideLoading()
      }
    );

    this.getCmtList()
  },
  

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
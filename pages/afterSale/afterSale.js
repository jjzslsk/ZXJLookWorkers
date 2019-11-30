// pages/afterSale/afterSale.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    detail:'',
    detailPics:[],
    orderId:'',
    content:'',
    pickedImgs: [],
    compressImgs: [],
    compressImgsIndex: 0,
    uploadedImgs: [],
    uploadedImgIndex: 0,
  },

  onInputChange: function (e) {
    this.setData({
      content: e.detail.value
    })

  },

  previewImage: function (e) {
    var i = e.currentTarget.dataset.i
    var detailPics = this.data.detailPics
    wx.previewImage({
      current: detailPics[i], // 当前显示图片的http链接
      urls: detailPics // 需要预览的图片http链接列表
    })
  },

  previewLocalImage: function (e) {
    var i = e.currentTarget.dataset.i
    var pickedImgs = this.data.pickedImgs
    wx.previewImage({
      current: pickedImgs[i], // 当前显示图片的http链接
      urls: pickedImgs // 需要预览的图片http链接列表
    })
  },

  chooseImage: function (e) {
    var pickedImgs = this.data.pickedImgs
    var that = this
    var count = 9 - pickedImgs.length
    wx.chooseImage({
      count: count,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        // tempFilePath可以作为img标签的src属性显示图片
        that.setData({
          //pickedImgs: res.tempFilePaths,
          compressImgs: res.tempFilePaths
        });
        that.compressImage()
      }
    })
  },

  compressImage: function () {
    var compressImgsIndex = this.data.compressImgsIndex
    var compressImgs = this.data.compressImgs
    var pickedImgs = this.data.pickedImgs

    var that = this
    if (compressImgsIndex < compressImgs.length) {
      wx.compressImage({
        src: compressImgs[compressImgsIndex],
        quality: 50,
        success(res) {
          pickedImgs.unshift(res.tempFilePath)

          compressImgsIndex = compressImgsIndex + 1

          that.setData({
            pickedImgs: pickedImgs,
            compressImgsIndex: compressImgsIndex
          })

          that.compressImage()
        }, fail(res) {
        }
      })
    } else {
      that.setData({
        compressImgsIndex: 0,
        compressImgs: []
      });
    }
  },

  deleteImg: function (e) {
    var i = e.currentTarget.dataset.index;
    var pickedImgs = this.data.pickedImgs
    pickedImgs.splice(i, 1)
    this.setData({
      pickedImgs: pickedImgs
    });
  },

  commitForm: function (e) {
    wx.showLoading({
      title: '提交中',
    })
    var pickedImgs = this.data.pickedImgs
    if (pickedImgs.length > 0) {
      this.uploadImg()
    } else {
      this.commit()
    }
  },

  uploadImg: function (e) {
    var uploadedImgIndex = this.data.uploadedImgIndex
    var pickedImgs = this.data.pickedImgs
    var uploadedImgs = this.data.uploadedImgs

    var uploadImgParam = {
      attUser: app.globalData.userId,
      attFkId: this.data.orderId,
      attFkName: "[work_apply_after_sale]",
      attName: "[_" + uploadedImgIndex + "_work_apply_after_sale.jpg]",
      clientId: app.globalData.userId
    }
    var that = this
    wx.uploadFile({
      url: app.globalData.fileUrl,
      filePath: pickedImgs[uploadedImgIndex],
      name: 'file',
      formData: uploadImgParam,
      success(res) {
        if (res.data) {
          var resData = JSON.parse(res.data)
          if (resData.pic && resData.pic.length > 0)
            uploadedImgs.push(resData.pic[0].pic)

          that.setData({
            uploadedImgs: uploadedImgs
          })
        }

        uploadedImgIndex++
        that.setData({
          uploadedImgIndex: uploadedImgIndex
        })
        if (uploadedImgIndex < pickedImgs.length) {
          that.uploadImg()
        } else {
          that.commit()
        }
      }
    })

  },

  commit: function (e) {
    if (this.data.content == '') {//判空
      wx.showToast({
        title: '请输入问题描述内容',
        icon: 'none',
        duration: 2000
      })
      return
    }
    var param = 'id=' + this.data.orderId + '&userId=' + app.globalData.userId + '&afterSaleDesc=' + this.data.content
    var that=this
    app.httpsDataGet('/worker/applyForAfterSales', param,
      function (res) {
        that.initData()
        wx.hideLoading()
      },
      function (returnFrom, res) {
        wx.showToast({
          title: '提交失败',
          icon: 'none',
          duration: 2000
        })
        //失败
        wx.hideLoading()
      }
    )
  },

  /**
   * 生命周期函数--监听页面加载
   */
  initData: function (options) {  
    var param = 'id=' + this.data.orderId + '&userId=' + app.globalData.userId
    var that = this
    app.httpsDataGet('/worker/getAfterSales', param,
      function (res) {
        wx.hideLoading()
        if (res.data && res.data.after_sale_desc){
          var detailPics = []
          if(res.data.pics.length>0){            
            for (var i = 0; i < res.data.pics.length;i++){
              detailPics[i] = res.data.pics[i].url
            }
          }
          
          that.setData({
            detail: res.data,
            detailPics: detailPics
          })
        }
      },
      function (returnFrom, res) {
        //失败
        wx.hideLoading()
      }
    )
  },

  onLoad: function (options) {
    var orderId = options.orderId
    this.setData({
      orderId: orderId
    })
    this.initData()
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
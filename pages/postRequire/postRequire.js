// pages/postRequire/postRequire.js
const app = getApp();
var userId = '';
Page({

  /**
   * 页面的初始数据
   */
  data: {
      autoFocus:false,
      //input地址内容
      addressInfo:'',
      type:'postByClass',
      workerId: '',
      workerName: '',
      classList:[],
      firstClassList: [], //一级分类
      secondClassList: [], //二级分类
      fcIndex:0,
      pickedSCID: '',
      pickedSCName:'',
      pickedItem:'',

      pickedPT:'',
      pickedImgs:[],
      compressImgs: [],
      compressImgsIndex:0,
      uploadedImgs:[],
      uploadedImgIndex:0,

      showMore:false,

      sendMemoTeamArray: ['工装', '家装新房', '家装旧房', '自装', '完工结', '日结', '已认证身份'],
      sendMemoTeamPicked: ['', '', '', '', '', '', '', ''],
      payTypeList:['计件','计天','计面积'],
      ptIndex:0,
      cityName:'',

      gzbz: '',
      yjts: '',
      sxrs: '',
      yjfy: '',

      
      sendClientId:'',
      sendClientAddress:'',
      sendClientAddressPlaceHolder:'请完善详细地址...',
      sendLongitude: '',
      sendLatitude: '',


      workerId: '',
      sendWages: '',
      sendUnit: '',
      sendUnitHour: '',
      sendNegPriceFlag: false,
      planStartDate: '请选择',
      planStartTime:'请选择',
      planEndDay: '',
      planPeopleNum: '',
      orgId: '',
      workAddress: '',
      sendMemo: '',
      sendMemoTeam: '',
      workStatus: '0',
      workType:'0',
      workBasicRecord:''
      
  },

  clickAgreement(e){
    var content = e.currentTarget.dataset.content;
    wx.navigateTo({
      url: '/pages/agreement/agreement?content=' + content
    })
  },

  showMore: function(e) {
    var showMore = this.data.showMore
    if (showMore)
      showMore=false
    else
      showMore=true

    this.setData({
      showMore: showMore
    })
  },

  autoFocus(){
    this.setData({
      autoFocus:true
    })
  },

  commitOrder:function(e){
    var that = this;
    that.payDialog.showPayDialog('1', '2', '预约', function (ret) {
      

    });
  },

  onPriceFlagChange: function (e) {
    var sendNegPriceFlag = this.data.sendNegPriceFlag
    if (sendNegPriceFlag){
      this.setData({
        sendNegPriceFlag: false
      })
    }else{
      this.setData({
        sendNegPriceFlag: true
      })
    }

  },

  onPriceItemInput: function (e) {	
    var type = e.currentTarget.dataset.type;		
    var val = e.detail.value;
    if (val.length == 1){ 
      val = val.replace(/[^1-9]/g, '') 
    }else{ 
      val = val.replace(/\D/g, '')
    }

    if (type == 'yjfy') {
      this.setData({
        yjfy: val
      })
    }else{
      if (type=='gzbz'){
        this.setData({
          gzbz: val
        })   
      } else if (type == 'yjts') {
        this.setData({
          yjts: val
        })
      } else if (type == 'sxrs') {
        this.setData({
          sxrs: val
        })
      } 

      var gzbz = this.data.gzbz
      var yjts = this.data.yjts
      var sxrs = this.data.sxrs
      var yjfy = this.data.yjfy
  
      if (gzbz && yjts && sxrs){
        this.setData({
          yjfy: gzbz * yjts * sxrs
        })
      }
    }
  },

  onInputChange: function (e) {
    var type = e.currentTarget.dataset.type;		
    var val = e.detail.value
    val = val.replace(/[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF][\u200D|\uFE0F]|[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF]|[0-9|*|#]\uFE0F\u20E3|[0-9|#]\u20E3|[\u203C-\u3299]\uFE0F\u200D|[\u203C-\u3299]\uFE0F|[\u2122-\u2B55]|\u303D|[\A9|\AE]\u3030|\uA9|\uAE|\u3030/g, "");
    if (type == 'sendWages') {
      this.setData({
        sendWages: val
      })
    } else if (type == 'sendMemo') {
      this.setData({
        sendMemo: val
      })
    } else if (type == 'sendClientAddress') {
      this.setData({
        sendClientAddress: val,
        workAddress: val
      })
    } 

  },

  pickWorkerClass: function (e) {
    
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
          //pickedImgs: pickedImgs,
          compressImgs: res.tempFilePaths
        });
        that.compressImage()
      }
    })
  },

  compressImage: function (){
    var compressImgsIndex = this.data.compressImgsIndex
    var compressImgs = this.data.compressImgs
    var pickedImgs = this.data.pickedImgs
   
    var that = this    
    if (compressImgsIndex < compressImgs.length){
      wx.compressImage({
        src: compressImgs[compressImgsIndex],
        quality: 50,
        success(res) {
          pickedImgs.unshift(res.tempFilePath)

          compressImgsIndex = compressImgsIndex+1
          
          that.setData({
            pickedImgs: pickedImgs,
            compressImgsIndex: compressImgsIndex
          })

          that.compressImage()
        }, fail(res){
        }
      })
    }else{
      that.setData({
        compressImgsIndex: 0,
        compressImgs:[]
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

  commitForm: function (e){
    userId = app.globalData.userId;
    wx.showLoading({
      title: '提交中',
    })
    var pickedImgs = this.data.pickedImgs
    if (pickedImgs.length>0){
      this.uploadImg()
    }else{
      this.commit()
    }
  },

  /**
   * 请求行情数据
   */
  getMarketData: function () {
    wx.navigateTo({
      url: '/pages/marketInfo/marketInfo?orgId=' + this.data.orgId + '&city=' + this.data.cityName
    })
  },

  uploadImg: function (e) {
    var uploadedImgIndex = this.data.uploadedImgIndex
    var pickedImgs = this.data.pickedImgs
    var uploadedImgs = this.data.uploadedImgs
    var uploadImgParam = {
      attUser: userId,
      attFkId: userId,
      attFkName: "[9_client_place]",
      attName: "[_"+uploadedImgIndex+"_9_client_place.jpg]",
      clientId: userId,
      attNoWater:'1'
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

  chooseLocation: function (e){
    var that=this
    wx.chooseLocation({
      success(res) {
        that.setData({
          sendClientAddress: res.address,
          workAddress: res.address
        })
      }
    })
  },
  
  commit:function(){
    var sendClientAddress = this.data.sendClientAddress;

    var param={};
    param.sendClientId = userId
    param.workBasicRecord = this.data.workBasicRecord
    param.planStartDate = this.data.planStartDate + ' ' + this.data.planStartTime
    param.sendClientAddress = this.data.sendClientAddress
    param.sendLongitude = this.data.sendLongitude
    param.sendLatitude = this.data.sendLatitude

    
    param.workerId=''
    param.sendUnit = this.data.sendUnit

    param.sendWages = this.data.gzbz
    param.sendNegPriceFlag = this.data.sendNegPriceFlag
    param.planPeopleNum = this.data.sxrs
    param.planEndDay = this.data.yjts
    param.sendMemo = this.data.sendMemo
    param.sendMemoTeam = this.data.sendMemoTeam    
    param.sendUnitHour = this.data.yjfy
    
    param.orgId = this.data.orgId
    param.workAddress = this.data.workAddress
    
    param.workStatus = this.data.workStatus
    param.workerId = this.data.workerId
    param.workType = this.data.workType
    param.pics = this.data.uploadedImgs

    var smtp = this.data.sendMemoTeamPicked
    var smtp_str = ''
    for (var i = 0; i < smtp.length; i++) {
      if (smtp[i]) {
        if (smtp_str)
          smtp_str += ',' + smtp[i]
        else
          smtp_str += smtp[i]
      }
    }

    param.sendMemoTeam = smtp_str

    if (this.data.planStartDate == '请选择'){//判空
      wx.showToast({
          title: '请选择开工日期',
          icon: 'none',
          duration: 2000
      }) 
    } else if (this.data.planStartTime=='请选择') {//判空
      wx.showToast({
        title: '请选择开工时间',
        icon: 'none',
        duration: 2000
      })
    } else if (!this.data.sendClientAddress) {//判空
      wx.showToast({
        title: '请完善详细地址',
        icon: 'none',
        duration: 2000
      })
    }else {
        app.httpsDataPost3('/worker/publishDemand', param,
        function (res) {		
          //成功
          if (res.status){
            wx.showToast({
              title: '发布成功',
              icon: 'success',
              duration: 2000
            })
            wx.reLaunch({
              url: '/pages/orderDone/orderDone?demandId=' + res.data.demandId + '&orderNumber=' + res.data.orderNumber
            })
          }
        },
        function (returnFrom, res) {
          if(res.code == '0000'){
            wx.showModal({
              title: '提示',
              content: '用户未登录，请先登录',
              success (res) {
                if (res.confirm) {
                  wx.navigateTo({
                    url: '/pages/bindPhone/bindPhone'
                  })
                } else if (res.cancel) {
                }
              }
            })
          }
          //失败
          wx.hideLoading()
        }
      )
    }
  },

  bindPickerChange: function (e) {
    this.setData({
      fcIndex: e.detail.value,
      secondClassList: this.data.classList[e.detail.value].child,
      pickedSCID:'',
      pickedSCName:''
    })   
  },

  bindPayTypeChange: function (e) {
    this.setData({
      ptIndex: e.detail.value
    })
  },

  bindDateChange: function (e) {
    var theDate = new Date()
    var year = theDate.getFullYear()
    var month = theDate.getMonth() + 1
    if (month < 10)
      month = '0' + month

    var day = theDate.getDate()
    if (day < 10)
      day = '0' + day

    var h = theDate.getHours()+1
    if (h < 10)
      h = '0' + h

    var m = theDate.getMinutes()
    if (m < 10)
      m = '0' + m

    var pickedTime = h+':'+m
    var planStartTime = this.data.planStartTime

    var nowDate = year + '-' + month + '-' + day

    var valid=false
    if (e.detail.value > nowDate){
      valid = true
    } else if (e.detail.value == nowDate){
      if (pickedTime && pickedTime!='请选择'){
        if (planStartTime >= pickedTime) {
          valid = true
        }
      }else{
        valid = true
      }
    }

    if (!valid){
      wx.showModal({
        title: '提示',
        content: '开工时间至少要在当前时间一小时后',
        showCancel: false,
        success: res => { }
      })
    }else{
      this.setData({
        planStartDate: e.detail.value
      })
    }
  },

  bindTimeChange: function (e) {
    var planStartDate = this.data.planStartDate
    if (planStartDate=='请选择') {
      wx.showModal({
        title: '提示',
        content: '请先选择开工日期',
        showCancel: false,
        success: res => { }
      })
      return
    }

    var theDate = new Date()
    var year = theDate.getFullYear()
    var month = theDate.getMonth() + 1
    if (month < 10)
      month = '0' + month

    var day = theDate.getDate()
    if (day < 10)
      day = '0' + day

    var h = theDate.getHours() + 1
    if (h < 10)
      h = '0' + h

    var m = theDate.getMinutes()
    if (m < 10)
      m = '0' + m

    var nowDate = year + '-' + month + '-' + day
    var nowTime = h + ':' + m
    var pickedTime = e.detail.value

    var valid = false
    if (planStartDate > nowDate){
      valid = true
    }else{
      if (pickedTime >= nowTime) {
        valid = true
      }
    }

    if (!valid) {
      wx.showModal({
        title: '提示',
        content: '开工时间至少要在当前时间一小时后',
        showCancel: false,
        success: res => { }
      })
    } else {
      this.setData({
        planStartTime: pickedTime
      })
    }

  },

  typeItemTap: function (e) {	
    var id = e.currentTarget.dataset.id;	
    var name = e.currentTarget.dataset.name;	
    this.setData({
      pickedSCID: id,
      pickedSCName: name
    }) 
  },

  payTypeItemTap: function (e) {
    var name = e.currentTarget.dataset.name;
    this.setData({
      pickedPT: name
    })
  },

  sendMemoTeamTap: function (e) {
    var i = e.currentTarget.dataset.i
    var content = e.currentTarget.dataset.content
    var smtp = this.data.sendMemoTeamPicked

    if (smtp[i])
      content = ''

    smtp[i] = content
    this.setData({
      sendMemoTeamPicked: smtp
    })
  },

  previewImage: function (e) {
    var i = e.currentTarget.dataset.i
    var pickedImgs = this.data.pickedImgs
    wx.previewImage({
      current: pickedImgs[i], // 当前显示图片的http链接
      urls: pickedImgs // 需要预览的图片http链接列表
    })
  },

  //使用百度滴入api，通过坐标获取当前城市名称
  loadCity: function (longitude, latitude) {
    var that = this
    wx.request({
      url: app.globalData.baiduUrl + '/geocoder/v2/?ak=MTz5ezwHwFTe7r01m66QuGIUOr4ZnSK2&location=' + latitude + ',' + longitude + '&output=json',
      data: {},
      header: {
        'Content-Type': 'application/json'
      },
      success: function (res) {
        var cityCode = res.data.result.cityCode;
        var city = res.data.result.addressComponent.city;
        that.setData({
          sendClientAddress: res.data.result.addressComponent.province + res.data.result.addressComponent.city + res.data.result.addressComponent.district,
          workAddress: res.data.result.addressComponent.province + res.data.result.addressComponent.city + res.data.result.addressComponent.district,
          orgId:res.data.result.cityCode,
          cityName: res.data.result.addressComponent.city
        });

      },
      fail: function () {
        that.setData({
          sendClientAddressPlaceHolder: '定位失败，请手动输入'
        });
      },
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    userId = app.globalData.userId;
    var type = options.type

    var that = this;
    var theDate=new Date()
    var month = theDate.getMonth()+1;
    if(month<10)
      month='0'+month

    var day = theDate.getDate();
    if (day < 10)
      day = '0' + day

    var planStartDate = theDate.getFullYear() + '-' + month + '-' + day
    var pickedItem = options.pickedItem
    if (type =='book'){
      that.setData({
        workerId: options.workerId,
        workerName: options.workerName,
        workBasicRecord: JSON.parse(pickedItem),
        workType:'1'
      });

      wx.setNavigationBarTitle({
        title: '立即预约'
      })
    } else if (type == 'postByClass'){     
      that.setData({
        workBasicRecord: JSON.parse(pickedItem),
        workType: '0'
      });
    }

    that.setData({
      type: type
    });

    wx.getLocation({
      type: 'wgs84', //默认为 wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标 
      success: function (res) {
        
        var longitude = res.longitude
        var latitude = res.latitude
        that.setData({
          sendLongitude: longitude,
          sendLatitude: latitude
        });
        that.loadCity(longitude, latitude)
      },
      fail: function () {
        that.setData({
          sendClientAddressPlaceHolder: '定位失败，请手动输入'
        });
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    //获得payDialog组件
    this.payDialog = this.selectComponent("#payDialog");
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    userId = app.globalData.userId;
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
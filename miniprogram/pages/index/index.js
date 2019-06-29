//index.js
const app = getApp()

Page({
  data: {
    form: {
      name: '',
      price: '',
      imageId: ''
    },
    uploadedImageUrl: ''
  },

  onInput: function(e) {
    const type = e.target.dataset.type;
    const value = e.detail.value;
    this.setData({
      form: {
        ...this.data.form,
        [type]: value
      }
    });
  },
  onSave: function() {
    const {form} = this.data;
    const {name, price, imageId} = form;

    if (!name || !price || !imageId) {
      wx.showToast({
        icon: 'none',
        title: '请确认页面信息是否完整',
      });
      return;
    }
    wx.showLoading({
      title: '正在保存...',
    });
    wx.cloud.callFunction({
      name: 'api',
      data: {
        action: 'addProduct',
        form: form
      },
      success: res => {
        wx.hideLoading();
        wx.showToast({
          title: '保存成功',
        });
        this.setData({
          form: {
            name: '',
            price: '',
            imageId: ''
          }
        });
      },
      fail: (e) => {
        console.error(e);
        wx.hideLoading();
        wx.showToast({
          icon: 'none',
          title: '保存失败',
        });
      }
    })
  },

  onGetOpenid: function() {
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        app.globalData.openid = res.result.openid
        
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
        
      }
    })
  },

  // 上传图片
  doUpload: function () {
    // 选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: res => {

        wx.showLoading({
          title: '上传中',
        })

        const filePath = res.tempFilePaths[0]
        
        // 上传图片
        const cloudPath = 'fruits/' + filePath.match(/\.[^.]+?$/)[0];
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: res => {
            this.setData({
              form: {
                ...this.data.form,
                imageId: res.fileID
              }
            });
          },
          fail: e => {
            console.error('[上传文件] 失败：', e)
            wx.showToast({
              icon: 'none',
              title: '上传失败',
            })
          },
          complete: () => {
            wx.hideLoading()
          }
        })

      },
      fail: e => {
        console.error(e)
      }
    })
  },

})

<template>
  <div class="publish">
    <div class="publish-card">
      <!-- 头部 -->
      <div class="publish-header">
        <div class="header-icon-wrap">
          <span class="header-icon">📝</span>
        </div>
        <h1 class="publish-title">发布信息</h1>
        <p class="publish-sub">填写物品信息，帮助它找到主人</p>
      </div>

      <!-- 类型切换 -->
      <div class="type-toggle">
        <button
          :class="['type-btn', { active: form.type === 'lost' }]"
          @click="form.type = 'lost'"
        >
          <span class="type-icon">📢</span>
          <span class="type-text">寻物启事</span>
          <span class="type-desc">我丢了东西</span>
        </button>
        <button
          :class="['type-btn', { active: form.type === 'found' }]"
          @click="form.type = 'found'"
        >
          <span class="type-icon">🎁</span>
          <span class="type-text">招领启事</span>
          <span class="type-desc">我捡到东西</span>
        </button>
      </div>

      <!-- 表单 -->
      <el-form :model="form" class="pub-form" label-position="top">
        <!-- 物品名称 -->
        <el-form-item label="物品名称" required>
          <el-input
            v-model="form.title"
            placeholder="请输入物品名称，如：黑色钱包、iPhone 14"
            size="large"
            class="form-input"
          />
        </el-form-item>

        <!-- 分类 -->
        <el-form-item label="物品分类" required>
          <el-select
            v-model="form.category"
            placeholder="请选择物品分类"
            size="large"
            style="width: 100%"
            class="form-select"
          >
            <el-option
              v-for="c in categories"
              :key="c"
              :label="c"
              :value="c"
            />
          </el-select>
        </el-form-item>

        <!-- 地点和时间 -->
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item :label="form.type === 'lost' ? '丢失地点' : '拾取地点'">
              <el-input
                v-model="form.place"
                :placeholder="form.type === 'lost' ? '请输入丢失地点' : '请输入拾取地点'"
                size="large"
                class="form-input"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="form.type === 'lost' ? '丢失时间' : '拾取时间'">
              <el-date-picker
                v-model="form.time"
                type="datetime"
                :placeholder="form.type === 'lost' ? '请选择丢失时间' : '请选择拾取时间'"
                size="large"
                style="width: 100%"
                class="form-datepicker"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 联系方式 -->
        <el-form-item label="联系方式">
          <el-input
            v-model="form.contact"
            placeholder="请输入手机号或QQ号"
            size="large"
            class="form-input"
          />
        </el-form-item>

        <!-- 图片上传 -->
        <el-form-item label="物品图片">
          <label class="upload-label">
            <div class="upload-box" :class="{ 'has-file': fileName }">
              <div v-if="!fileName" class="upload-content">
                <div class="upload-icon-wrap">
                  <el-icon class="upload-icon"><Camera /></el-icon>
                </div>
                <span class="upload-hint">点击上传物品图片</span>
                <span class="upload-tip">支持 JPG、PNG、GIF、WebP，最大 5MB</span>
              </div>
              <div v-else class="upload-success">
                <el-icon class="success-icon"><Check /></el-icon>
                <span class="upload-name">{{ fileName }}</span>
                <span class="upload-change">点击更换</span>
              </div>
              <img
                v-if="previewUrl"
                :src="previewUrl"
                class="preview-image"
              />
            </div>
            <input
              type="file"
              @change="onFileChange"
              accept="image/*"
              hidden
            />
          </label>
        </el-form-item>

        <!-- 描述 -->
        <el-form-item label="补充描述">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="4"
            placeholder="请描述物品的颜色、品牌、特征等详细信息，方便失主/拾主识别..."
            size="large"
            class="form-textarea"
          />
        </el-form-item>

        <!-- 提交按钮 -->
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            @click="submit"
            :loading="submitting"
            class="submit-btn"
          >
            <span class="btn-content">
              <span class="btn-text">发布{{ form.type === 'lost' ? '寻物' : '招领' }}信息</span>
              <el-icon class="btn-icon"><ArrowRight /></el-icon>
            </span>
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Camera, Check, ArrowRight } from '@element-plus/icons-vue'
import api from '../api'
import { categories } from '../utils'

export default {
  name: 'PublishView',
  components: {
    Camera, Check, ArrowRight
  },
  setup() {
    const router = useRouter()
    const form = reactive({
      type: 'lost',
      title: '',
      category: '',
      place: '',
      time: null,
      contact: '',
      description: ''
    })
    const submitting = ref(false)
    const file = ref(null)
    const fileName = ref('')
    const previewUrl = ref('')

    const onFileChange = (e) => {
      const selectedFile = e.target.files[0]
      if (selectedFile) {
        // 释放旧的 blob URL 防止内存泄漏
        if (previewUrl.value) {
          URL.revokeObjectURL(previewUrl.value)
        }
        // 验证文件大小
        if (selectedFile.size > 5 * 1024 * 1024) {
          ElMessage.warning('文件大小不能超过 5MB')
          return
        }
        // 验证文件类型
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        if (!allowedTypes.includes(selectedFile.type)) {
          ElMessage.warning('只支持 JPG、PNG、GIF、WebP 格式的图片')
          return
        }
        file.value = selectedFile
        fileName.value = selectedFile.name
        previewUrl.value = URL.createObjectURL(selectedFile)
      }
    }

    const submit = async () => {
      if (!form.title || !form.category) {
        ElMessage.warning('请至少填写物品名称和分类')
        return
      }

      submitting.value = true
      const fd = new FormData()
      fd.append('title', form.title)
      fd.append('category', form.category)
      fd.append('description', form.description)
      fd.append('contact_info', form.contact)
      fd.append(form.type === 'lost' ? 'lost_place' : 'found_place', form.place)

      if (form.time) {
        const d = form.time
        const pad = (n) => String(n).padStart(2, '0')
        const timeStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
        fd.append(form.type === 'lost' ? 'lost_time' : 'found_time', timeStr)
      }

      if (file.value) {
        fd.append('image', file.value)
      }

      try {
        if (form.type === 'lost') {
          await api.createLost(fd)
        } else {
          await api.createFound(fd)
        }
        ElMessage.success('发布成功')
        router.push('/')
      } catch (e) {
        console.error(e)
      } finally {
        submitting.value = false
      }
    }

    return {
      form, submitting, categories, fileName, previewUrl,
      onFileChange, submit
    }
  }
}
</script>

<style scoped>
.publish {
  max-width: 640px;
  margin: 0 auto;
  padding: 0 24px 40px;
}

.publish-card {
  background: white;
  border-radius: 20px;
  padding: 40px 32px;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-light);
}

/* 头部 */
.publish-header {
  text-align: center;
  margin-bottom: 32px;
}

.header-icon-wrap {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #eef1ff 0%, #f0f3ff 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}

.header-icon {
  font-size: 32px;
}

.publish-title {
  font-size: 26px;
  font-weight: 800;
  color: var(--text);
  margin-bottom: 8px;
}

.publish-sub {
  font-size: 14px;
  color: var(--text-secondary);
}

/* 类型切换 */
.type-toggle {
  display: flex;
  gap: 12px;
  margin-bottom: 32px;
}

.type-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px 16px;
  border: 2px solid var(--border);
  border-radius: 16px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.type-btn:hover {
  border-color: var(--primary);
  background: var(--primary-light);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.type-btn.active {
  border-color: var(--primary);
  background: var(--primary-light);
  box-shadow: 0 4px 12px rgba(79, 110, 246, 0.2);
}

.type-icon {
  font-size: 28px;
}

.type-text {
  font-size: 16px;
  font-weight: 700;
  color: var(--text);
}

.type-desc {
  font-size: 12px;
  color: var(--text-muted);
}

.type-btn.active .type-text {
  color: var(--primary);
}

/* 表单 */
.pub-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pub-form :deep(.el-form-item__label) {
  font-weight: 600;
  color: var(--text);
  padding-bottom: 8px;
}

.form-input :deep(.el-input__wrapper) {
  border-radius: 12px;
  box-shadow: 0 0 0 1px var(--border) inset;
  padding: 4px 12px;
  transition: all 0.2s ease;
}

.form-input :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px var(--primary) inset;
}

.form-input :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px var(--primary) inset;
}

.form-select :deep(.el-input__wrapper) {
  border-radius: 12px;
}

.form-textarea :deep(.el-textarea__inner) {
  border-radius: 12px;
  box-shadow: 0 0 0 1px var(--border) inset;
  padding: 12px;
  transition: all 0.2s ease;
}

.form-textarea :deep(.el-textarea__inner:hover) {
  box-shadow: 0 0 0 1px var(--primary) inset;
}

.form-textarea :deep(.el-textarea__inner:focus) {
  box-shadow: 0 0 0 2px var(--primary) inset;
}

/* 图片上传 */
.upload-label {
  display: block;
  cursor: pointer;
  width: 100%;
}

.upload-box {
  border: 2px dashed var(--border);
  border-radius: 16px;
  padding: 32px;
  text-align: center;
  transition: all 0.2s ease;
  background: var(--bg);
}

.upload-box:hover {
  border-color: var(--primary);
  background: var(--primary-light);
}

.upload-box.has-file {
  border-style: solid;
  border-color: #5baf7f;
  background: #f0fdf4;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.upload-icon-wrap {
  width: 56px;
  height: 56px;
  background: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-sm);
}

.upload-icon {
  font-size: 24px;
  color: var(--primary);
}

.upload-hint {
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
}

.upload-tip {
  font-size: 12px;
  color: var(--text-muted);
}

.upload-success {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.success-icon {
  font-size: 32px;
  color: #5baf7f;
}

.upload-name {
  font-size: 14px;
  font-weight: 600;
  color: #5baf7f;
}

.upload-change {
  font-size: 12px;
  color: var(--primary);
  text-decoration: underline;
}

.preview-image {
  max-width: 200px;
  max-height: 120px;
  margin-top: 16px;
  border-radius: 12px;
  box-shadow: var(--shadow-md);
}

/* 提交按钮 */
.submit-btn {
  width: 100%;
  height: 52px;
  font-size: 16px;
  font-weight: 700;
  border-radius: 14px;
  background: linear-gradient(135deg, #4f6ef6 0%, #6c5ce7 100%);
  border: none;
  box-shadow: 0 4px 16px rgba(79, 110, 246, 0.35);
  transition: all 0.3s ease;
  margin-top: 8px;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(79, 110, 246, 0.45);
}

.submit-btn:active {
  transform: translateY(0);
}

.btn-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-icon {
  transition: transform 0.3s ease;
}

.submit-btn:hover .btn-icon {
  transform: translateX(4px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .publish {
    padding: 0 16px 32px;
  }

  .publish-card {
    padding: 24px 20px;
  }

  .type-toggle {
    flex-direction: column;
  }

  .type-btn {
    flex-direction: row;
    justify-content: center;
    padding: 16px;
  }
}

@media (max-width: 480px) {
  .publish-card {
    border-radius: 16px;
    padding: 20px 16px;
  }
}
</style>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { maintenanceApi } from '../api'
import { ElMessage } from 'element-plus'

const systems = ref([
  { id: 'sys-001', name: '曳引系统', selected: true },
  { id: 'sys-002', name: '导向系统', selected: true },
  { id: 'sys-003', name: '电气控制系统', selected: true },
  { id: 'sys-004', name: '门系统', selected: true }
])

const records = ref([])
const loading = ref(false)
const totalItems = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

// 计算筛选后的维护记录
const filteredRecords = computed(() => {
  return records.value.filter(record => {
    const system = systems.value.find(sys => sys.name === record.systemName)
    return system ? system.selected : false
  })
})

// 获取维护记录数据
const fetchMaintainData = async () => {
  loading.value = true
  try {
    const params = {
      current: currentPage.value,
      size: pageSize.value
    }
    
    // 添加系统名称筛选
    const selectedSystems = systems.value.filter(sys => sys.selected).map(sys => sys.name)
    if (selectedSystems.length === 1) {
      params.systemName = selectedSystems[0]
    }
    
    const response = await maintenanceApi.getMaintenance(params)
    if (response.data.code === 200) {
      records.value = response.data.data.records
      totalItems.value = response.data.data.total
    } else {
      ElMessage.error('获取维护记录失败: ' + response.data.message)
    }
  } catch (error) {
    console.error('获取维护记录出错:', error)
    ElMessage.error('获取维护记录出错')
  } finally {
    loading.value = false
  }
}

// 查看详情
const viewDetails = (record) => {
  console.log('查看详情:', record)
}

// 更新维护状态
const updateStatus = async (record, newStatus) => {
  try {
    const updateData = {
      id: record.id,
      userId: record.userId,
      status: newStatus
    }
    const response = await maintenanceApi.updateMaintenance(updateData)
    if (response.data.code === 200) {
      ElMessage.success('更新维护状态成功')
      // 重新加载数据
      fetchMaintainData()
    } else {
      ElMessage.error('更新维护状态失败: ' + response.data.message)
    }
  } catch (error) {
    console.error('更新维护状态出错:', error)
    ElMessage.error('更新维护状态出错')
  }
}

// 处理筛选
const handleFilter = () => {
  currentPage.value = 1
  fetchMaintainData()
}

// 处理页码变化
const handlePageChange = (page) => {
  currentPage.value = page
  fetchMaintainData()
}

// 组件挂载时获取数据
onMounted(() => {
  fetchMaintainData()
})
</script>

<template>
  <div class="maintenance-log">
    <div class="filter-box">
      <h3>筛选条件</h3>
      <div class="filter-options">
        <div class="filter-item" v-for="system in systems" :key="system.id">
          <el-checkbox v-model="system.selected" @change="handleFilter">{{ system.name }}</el-checkbox>
        </div>
      </div>
    </div>
    
    <div class="maintenance-list">
      <el-table :data="filteredRecords" border v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="systemName" label="系统类型" />
        <el-table-column prop="userId" label="维护人员ID" />
        <el-table-column prop="mtTime" label="维护时间" />
        <el-table-column prop="status" label="状态" />
        <el-table-column prop="remark" label="备注" />
        <el-table-column label="操作" width="180">
          <template #default="scope">
            <el-button size="small" @click="viewDetails(scope.row)">详情</el-button>
            <el-button size="small" type="primary" 
                       @click="updateStatus(scope.row, '已维护')"
                       v-if="scope.row.status !== '已维护'">
              标记已维护
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination">
        <el-pagination
          background
          layout="prev, pager, next"
          :total="totalItems"
          :current-page="currentPage"
          :page-size="pageSize"
          @current-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.maintenance-log {
  padding: 20px;
}
.filter-box {
  background: #fff;
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
.filter-options {
  display: flex;
  gap: 24px;
  margin-top: 12px;
}
.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
}
.maintenance-list {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
.pagination {
  margin-top: 20px;
  text-align: center;
}
</style>
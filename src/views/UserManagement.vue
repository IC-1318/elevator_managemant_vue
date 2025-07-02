<script setup>
import { ref, onMounted } from 'vue';
import { usersApi } from '../api';
import { ElMessage } from 'element-plus';

const userList = ref([]);
const loading = ref(false);

const showAddDialog = ref(false);
const newUser = ref({
  userName: '',
  userPhone: '',
  position: '待分配',
  id: ''
});

const positions = ['待分配', '维护人员', '管理人员', '技术人员'];

const handleAddUser = () => {
  showAddDialog.value = true;
};

const submitAddUser = async () => {
  try {
    if (!newUser.value.userName || !newUser.value.userPhone) {
      ElMessage.warning('请输入完整的人员信息');
      return;
    }
    
    loading.value = true;
    const response = await usersApi.addUser(newUser.value);
    
    if (response.data.code === 200) {
      ElMessage.success('添加人员成功');
      fetchUsers();
      showAddDialog.value = false;
      newUser.value = { userName: '', userPhone: '', position: '待分配', id: '' };
    } else {
      ElMessage.error('添加人员失败: ' + response.data.message);
    }
  } catch (error) {
    console.error('添加人员失败:', error);
    ElMessage.error('添加人员失败');
  } finally {
    loading.value = false;
  }
};

const handleDelete = async (user) => {
  try {
    const confirmed = confirm(`确认要删除人员 ${user.userName} 吗？`);
    if (!confirmed) return;
    
    loading.value = true;
    const response = await usersApi.deleteUser(user.id);
    
    if (response.data.code === 200) {
      ElMessage.success('删除人员成功');
      userList.value = userList.value.filter(u => u.id !== user.id);
    } else {
      ElMessage.error('删除人员失败: ' + response.data.message);
    }
  } catch (error) {
    console.error('删除人员失败:', error);
    ElMessage.error('删除人员失败');
  } finally {
    loading.value = false;
  }
};

const fetchUsers = async () => {
  // 注意：此处应该有获取用户列表的API，但后端暂未提供
  // 模拟获取用户列表
  loading.value = true;
  try {
    // 模拟数据
    userList.value = [
      { id: '1001', userName: '张三', userPhone: '13800000001', position: '维护人员' },
      { id: '1002', userName: '李四', userPhone: '13800000002', position: '技术人员' },
      { id: '1003', userName: '王五', userPhone: '13800000003', position: '管理人员' }
    ];
  } catch (error) {
    console.error('获取用户列表失败:', error);
    ElMessage.error('获取用户列表失败');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchUsers();
});
</script>

<template>
  <div class="user-management">
    <div class="header-panel">
      <h2>用户管理</h2>
      <el-button type="primary" @click="handleAddUser">
        <el-icon><Plus /></el-icon>添加人员
      </el-button>
    </div>
    
    <div class="user-table">
      <el-table :data="userList" border v-loading="loading">
        <el-table-column prop="id" label="ID" width="100" />
        <el-table-column prop="userName" label="姓名" />
        <el-table-column prop="userPhone" label="联系电话" />
        <el-table-column prop="position" label="岗位" />
        <el-table-column label="操作" width="180">
          <template #default="scope">
            <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
  
  <!-- 添加用户弹窗 -->
  <el-dialog title="添加新人员" v-model="showAddDialog" width="500px">
    <el-form :model="newUser" label-width="80px">
      <el-form-item label="姓名">
        <el-input v-model="newUser.userName" placeholder="请输入姓名" />
      </el-form-item>
      <el-form-item label="联系电话">
        <el-input v-model="newUser.userPhone" placeholder="请输入联系电话" />
      </el-form-item>
      <el-form-item label="岗位">
        <el-select v-model="newUser.position" placeholder="请选择岗位" style="width: 100%">
          <el-option v-for="pos in positions" :key="pos" :label="pos" :value="pos" />
        </el-select>
      </el-form-item>
      <el-form-item label="员工ID">
        <el-input v-model="newUser.id" placeholder="请输入员工ID" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="submitAddUser" :loading="loading">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
.user-management {
  padding: 20px;
}

.header-panel {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.user-table {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
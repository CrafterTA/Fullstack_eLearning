import React, { useState, useEffect } from "react";
import { MdBlock, MdEdit, MdSearch } from "react-icons/md";
import { X } from "lucide-react";
import { getAllUsers, updateUser } from "../../services/UserService";
import { User } from "../../types/types";

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<User["role"]>("User");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAllUsers();
        console.log('Users set to state:', data);
        setUsers(data);
        setFilteredUsers(data);
      } catch (error: any) {
        console.error('Error in fetchUsers:', error.message);
        setError(error.message || "Không thể tải danh sách người dùng");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const filtered = users.filter(
      (user) =>
        user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
    console.log('Filtered users:', filtered); 
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  const handleToggleBlock = async (user: User) => {
    setLoading(true);
    setError(null);
    try {
      const newIsActive = user.is_active === 1 ? false : true; 
      console.log('Toggling block for user:', { id: user.id, is_active: newIsActive });
      await updateUser(Number(user.id), { is_active: newIsActive });
      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.id === user.id ? { ...u, is_active: newIsActive ? 1 : 0 } : u
        )
      );
    } catch (error: any) {
      console.error('Error in handleToggleBlock:', error.message);
      setError(error.message || "Không thể cập nhật trạng thái người dùng");
    } finally {
      setLoading(false);
    }
  };

  const openRoleModal = (user: User) => {
    setSelectedUser(user);
    setSelectedRole(user.role);
    setIsRoleModalOpen(true);
  };

  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setLoading(true);
    setError(null);
    try {
      console.log('Updating role for user:', { id: selectedUser.id, role: selectedRole }); // Log
      await updateUser(selectedUser.id, { role: selectedRole });
      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.id === selectedUser.id ? { ...u, role: selectedRole } : u
        )
      );
      setIsRoleModalOpen(false);
      setSelectedUser(null);
    } catch (error: any) {
      console.error('Error in handleUpdateRole:', error.message);
      setError(error.message || "Không thể cập nhật vai trò");
    } finally {
      setLoading(false);
    }
  };

  const renderRoleModal = () => (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/70 backdrop-blur-md p-4 transition-all duration-300"
      onClick={(e) => e.target === e.currentTarget && setIsRoleModalOpen(false)}
    >
      <form
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 relative transform transition-all scale-100 hover:scale-[1.01]"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleUpdateRole}
      >
        <button
          type="button"
          className="absolute top-4 right-4 p-1.5 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-all duration-200 group"
          onClick={() => setIsRoleModalOpen(false)}
        >
          <X className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
        </button>
        <h2 className="text-xl font-semibold mb-6 text-center text-gray-800">
          Cập nhật vai trò
        </h2>
        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
        <div className="space-y-6">
          <div className="relative">
            <label className="absolute -top-2 left-3 px-2 bg-white text-sm font-medium text-gray-600 transition-all duration-200">
              Vai trò <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full border border-gray-200 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition-all duration-300 bg-white hover:bg-gray-50 text-gray-800"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as User["role"])}
              required
            >
              <option value="User">User</option>
              <option value="Instructor">Instructor</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
          <div className="flex gap-4 pt-2">
            <button
              type="button"
              className="flex-1 px-4 py-3 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-all duration-300 hover:shadow-md"
              onClick={() => setIsRoleModalOpen(false)}
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white font-medium rounded-xl transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              disabled={loading}
            >
              {loading ? "Đang lưu..." : "Lưu vai trò"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );

  return (
    <div className="w-full min-h-screen overflow-x-hidden flex flex-col bg-gray-50">
      <div className="flex flex-col sm:flex-row justify-between items-center p-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition-all duration-300 bg-white hover:bg-gray-50 text-gray-800 placeholder-gray-400"
            placeholder="Tìm kiếm theo tên hoặc email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>
      </div>
      <div className="w-full flex-grow p-6">
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {loading ? (
          <p className="text-center text-gray-600">Đang tải...</p>
        ) : filteredUsers.length === 0 ? (
          <p className="text-center text-gray-600">Không tìm thấy người dùng</p>
        ) : (
          <div className="overflow-x-auto rounded-xl shadow-md">
            <table className="min-w-full bg-white">
              <thead className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white">
                <tr>
                  <th className="p-4 text-left text-sm font-semibold">Họ tên</th>
                  <th className="p-4 text-left text-sm font-semibold">Email</th>
                  <th className="p-4 text-left text-sm font-semibold">Vai trò</th>
                  <th className="p-4 text-left text-sm font-semibold">Ngày tham gia</th>
                  <th className="p-4 text-left text-sm font-semibold">Hành động</th>
                  <th className="p-4 text-left text-sm font-semibold">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user, idx) => (
                  <tr
                    key={user.email}
                    className={`${idx % 2 !== 0 ? "bg-gray-50" : "bg-white"} hover:bg-gray-100 transition-all duration-200`}
                  >
                    <td className="p-4 text-[15px] text-gray-900 font-medium flex items-center gap-2">
                      {user.avatar && (
                        <img
                          src={user.avatar}
                          alt={user.full_name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      )}
                      {user.full_name}
                    </td>
                    <td className="p-4 text-[15px] text-gray-600 font-medium">{user.email}</td>
                    <td className="p-4 text-[15px] text-gray-600 font-medium">{user.role}</td>
                    <td className="p-4 text-[15px] text-gray-600 font-medium">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <button
                          className="p-1.5 rounded-full hover:bg-gray-200 transition-all duration-200"
                          title={user.is_active === 1 ? "Chặn" : "Bỏ chặn"}
                          onClick={() => handleToggleBlock(user)}
                          disabled={loading}
                        >
                          <MdBlock
                            className={`w-5 h-5 ${user.is_active === 1 ? "text-red-500" : "text-green-500"}`}
                          />
                        </button>
                        <button
                          className="p-1.5 rounded-full hover:bg-gray-200 transition-all duration-200"
                          title="Cập nhật vai trò"
                          onClick={() => openRoleModal(user)}
                          disabled={loading}
                        >
                          <MdEdit className="w-5 h-5 text-blue-500" />
                        </button>
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`flex items-center gap-1 font-semibold ${
                          user.is_active === 1 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full inline-block ${
                            user.is_active === 1 ? "bg-green-500" : "bg-red-500"
                          }`}
                        ></span>
                        <span>{user.is_active === 1 ? "Hoạt động" : "Bị chặn"}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {isRoleModalOpen && renderRoleModal()}
    </div>
  );
};

export default UserManagement;
import React, { useState, useEffect } from 'react';
import { LayoutGrid, Tags, Plus, Trash2, Edit2, Save, X, RefreshCcw } from 'lucide-react';

import { categoryService } from '../../services/categoryService';
import { attributeService } from '../../services/attributeService';
import { attributeValueService } from '../../services/attributeValueService';
import type { CategoryResponse, AttributeResponse, AttributeValueResponse } from '../../types';

const AttributesConfig = () => {
  const [activeTab, setActiveTab] = useState<'categories' | 'attributes'>('categories');
  const [isLoading, setIsLoading] = useState(true);

  // States for Categories Tab
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [newCatName, setNewCatName] = useState('');
  const [editingCatId, setEditingCatId] = useState<number | null>(null);
  const [editingCatName, setEditingCatName] = useState('');

  // States for Attributes Tab (Master-Detail)
  const [attributes, setAttributes] = useState<AttributeResponse[]>([]);
  const [selectedAttrId, setSelectedAttrId] = useState<number | null>(null);
  const [attrValues, setAttrValues] = useState<AttributeValueResponse[]>([]);
  
  // Create / Edit states for Attributes
  const [newAttrName, setNewAttrName] = useState('');
  const [editingAttrId, setEditingAttrId] = useState<number | null>(null);
  const [editingAttrName, setEditingAttrName] = useState('');

  // Create / Edit states for Attribute Values
  const [newAttrValue, setNewAttrValue] = useState('');
  const [editingValueId, setEditingValueId] = useState<number | null>(null);
  const [editingValueText, setEditingValueText] = useState('');

  // --- INIT FETCH ---
  useEffect(() => {
    fetchInitialData();
  }, [activeTab]);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'categories') {
        const res = await categoryService.getAllCategories();
        setCategories(res.data || []);
      } else {
        const res = await attributeService.getAllAttributes();
        setAttributes(res.data || []);
        // Nếu chuyển sang tab Attributes mà đã có dữ liệu nhưng chưa chọn ai, chọn cái đầu tiên
        if (res.data?.length && !selectedAttrId) {
          handleSelectAttribute(res.data[0].id);
        }
      }
    } catch {
      console.error('Fetch Data Error');
    } finally {
      setIsLoading(false);
    }
  };

  // --- CATEGORIES LOGIC ---
  const handleAddCategory = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      await categoryService.createCategory({ name: newCatName.trim() });
      setNewCatName('');
      fetchInitialData();
     } catch {
       alert('Không thể tạo Category');
     }
  };

  const handleUpdateCategory = async (id: number) => {
    if (!editingCatName.trim()) return;
    try {
      await categoryService.updateCategory(id, { name: editingCatName.trim() });
      setEditingCatId(null);
      fetchInitialData();
     } catch {
       alert('Cập nhật Category thất bại');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (window.confirm('Bạn có chắc xoá Danh mục này?')) {
      try {
        await categoryService.deleteCategory(id);
        fetchInitialData();
      } catch {
        alert('Không thể xoá danh mục vì đang có Sản phẩm thuộc danh mục này.');
      }
    }
  };

  // --- ATTRIBUTES (MASTER) LOGIC ---
  const handleSelectAttribute = async (attrId: number) => {
    setSelectedAttrId(attrId);
    try {
      const res = await attributeValueService.getAttributeValuesByAttributeId(attrId);
      setAttrValues(res.data || []);
    } catch {
      console.error('Không tải được giá trị thuộc tính');
    }
  };

  const handleAddAttribute = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newAttrName.trim()) return;
    try {
      const res = await attributeService.createAttribute({ name: newAttrName.trim() });
      setNewAttrName('');
      await fetchInitialData();
      if (res.data?.id) handleSelectAttribute(res.data.id);
    } catch {
      alert('Tạo thuộc tính thất bại');
    }
  };

  const handleUpdateAttribute = async (id: number) => {
    if (!editingAttrName.trim()) return;
    try {
      await attributeService.updateAttribute(id, { name: editingAttrName.trim() });
      setEditingAttrId(null);
      fetchInitialData();
    } catch { alert('Cập nhật thuộc tính thất bại'); }
  };

  const handleDeleteAttribute = async (id: number) => {
    if (window.confirm('Xoá toàn bộ Nhóm Thuộc tính và các Giá trị con của nó?')) {
      try {
        await attributeService.deleteAttribute(id);
        if (selectedAttrId === id) {
           setSelectedAttrId(null);
           setAttrValues([]);
        }
        fetchInitialData();
      } catch { alert('Không thể xoá thuộc tính đang được dùng trong các Sản phẩm.'); }
    }
  };

  // --- ATTRIBUTE VALUES (DETAIL) LOGIC ---
  const handleAddAttrValue = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newAttrValue.trim() || !selectedAttrId) return;
    try {
      await attributeValueService.createAttributeValue({ value: newAttrValue.trim(), attributeId: selectedAttrId });
      setNewAttrValue('');
      handleSelectAttribute(selectedAttrId); // Reload Detail List
    } catch { alert('Tạo Giá Trị thất bại'); }
  };

  const handleUpdateAttrValue = async (id: number) => {
    if (!editingValueText.trim() || !selectedAttrId) return;
    try {
      await attributeValueService.updateAttributeValue(id, { value: editingValueText.trim(), attributeId: selectedAttrId });
      setEditingValueId(null);
      handleSelectAttribute(selectedAttrId);
    } catch { alert('Cập nhật Giá trị thất bại'); }
  };

  const handleDeleteAttrValue = async (id: number) => {
    if (window.confirm('Bạn muốn bỏ Giá trị phân loại này?')) {
      try {
        await attributeValueService.deleteAttributeValue(id);
        if (selectedAttrId) handleSelectAttribute(selectedAttrId);
      } catch { alert('Dữ liệu đang được kết nối với Variant không thể xoá!'); }
    }
  };

  // --- RENDER ---
  return (
    <div className="space-y-6">
      
      {/* Header & Tabs */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Từ điển Hệ thống</h1>
        
        <div className="flex bg-slate-100 p-1.5 rounded-xl w-max">
          <button 
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold transition-all shadow-sm ${
              activeTab === 'categories' 
                ? 'bg-white text-indigo-700 pointer-events-none' 
                : 'text-slate-500 hover:text-slate-700 shadow-none hover:bg-slate-200/50'
            }`}
          >
            <LayoutGrid size={18} /> Danh mục SP
          </button>
          <button 
             onClick={() => setActiveTab('attributes')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold transition-all shadow-sm ${
              activeTab === 'attributes' 
                ? 'bg-white text-indigo-700 pointer-events-none' 
                : 'text-slate-500 hover:text-slate-700 shadow-none hover:bg-slate-200/50'
            }`}
          >
            <Tags size={18} /> Thuộc tính Phân loại
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center p-20 text-slate-500">
           <RefreshCcw className="w-10 h-10 animate-spin mb-4 text-indigo-600" />
           <p>Đang đồng bộ cơ sở dữ liệu gốc...</p>
        </div>
      )}

      {!isLoading && activeTab === 'categories' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden max-w-4xl">
          <div className="p-6 bg-slate-50 border-b border-slate-100">
             <h2 className="font-bold text-slate-800 text-lg mb-4">Quản lý Danh mục (Category)</h2>
             
             {/* Quick Inline Add */}
             <form onSubmit={handleAddCategory} className="flex items-center gap-3">
               <input 
                 autoFocus
                 value={newCatName}
                 onChange={e => setNewCatName(e.target.value)}
                 placeholder="Nhập tên Danh mục mới (Vd: Laptop, Áo Nam...)" 
                 className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 font-medium"
               />
               <button type="submit" className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition">
                 <Plus size={18} /> Thêm
               </button>
             </form>
          </div>

          <table className="w-full text-left">
            <thead>
              <tr className="bg-white border-b border-slate-100 text-slate-500 text-sm">
                 <th className="py-4 px-6 font-semibold w-24">ID</th>
                 <th className="py-4 px-6 font-semibold">Tên Danh mục</th>
                 <th className="py-4 px-6 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categories.map(cat => (
                <tr key={cat.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-6 text-slate-500 font-medium">#{cat.id}</td>
                  <td className="py-4 px-6">
                    {editingCatId === cat.id ? (
                       <input 
                         autoFocus
                         className="px-3 py-1.5 border border-indigo-400 focus:ring-4 focus:ring-indigo-50 outline-none rounded-lg w-full max-w-xs font-semibold text-slate-800"
                         value={editingCatName}
                         onChange={e => setEditingCatName(e.target.value)}
                         onKeyDown={(e) => e.key === 'Enter' && handleUpdateCategory(cat.id)}
                       />
                    ) : (
                       <span className="font-bold text-slate-800">{cat.name}</span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-right">
                    {editingCatId === cat.id ? (
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleUpdateCategory(cat.id)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg"><Save size={18}/></button>
                        <button onClick={() => setEditingCatId(null)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg"><X size={18}/></button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => { setEditingCatId(cat.id); setEditingCatName(cat.name); }}
                          className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                           onClick={() => handleDeleteCategory(cat.id)}
                           className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                 <tr>
                    <td colSpan={3} className="py-12 text-center text-slate-500 font-medium">
                       Chưa có danh mục nào. Quá thanh bình!
                    </td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {!isLoading && activeTab === 'attributes' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
           
           {/* MASTER PANEL: Attributes List */}
           <div className="lg:col-span-5 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
               <div className="p-5 bg-slate-50 border-b border-slate-100">
                 <h2 className="font-bold text-slate-800 text-lg mb-3">Nhóm Thuộc tính</h2>
                 <form onSubmit={handleAddAttribute} className="flex gap-2">
                   <input 
                     placeholder="Vd: Màu sắc, Dung lượng..."
                     value={newAttrName}
                     onChange={e => setNewAttrName(e.target.value)}
                     className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50"
                   />
                   <button type="submit" className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition">
                      <Plus size={18} />
                   </button>
                 </form>
               </div>

               <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                 {attributes.map(attr => (
                   <div 
                     key={attr.id} 
                     onClick={() => { if (editingAttrId !== attr.id) handleSelectAttribute(attr.id); }}
                     className={`p-4 flex items-center justify-between cursor-pointer transition-colors border-l-4 ${
                       selectedAttrId === attr.id 
                          ? 'border-indigo-600 bg-indigo-50/50' 
                          : 'border-transparent hover:bg-slate-50'
                     }`}
                   >
                     {editingAttrId === attr.id ? (
                        <input 
                           autoFocus
                           className="px-2 py-1 border border-indigo-400 focus:ring-4 focus:ring-indigo-50 outline-none rounded-md w-full max-w-[150px] font-semibold text-slate-800 text-sm"
                           value={editingAttrName}
                           onChange={e => setEditingAttrName(e.target.value)}
                           onKeyDown={(e) => e.key === 'Enter' && handleUpdateAttribute(attr.id)}
                        />
                     ) : (
                        <div className="font-bold text-slate-800">
                          {attr.name} <span className="text-xs ml-2 bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-mono">{attr.attributeValueCount || attrValues.filter(v => v.attributeId === attr.id).length} option</span>
                        </div>
                     )}

                      {editingAttrId === attr.id ? (
                        <div className="flex gap-1 shrink-0 ml-2">
                           <button onClick={(e) => { e.stopPropagation(); handleUpdateAttribute(attr.id); }} className="p-1.5 text-emerald-600"><Save size={16}/></button>
                           <button onClick={(e) => { e.stopPropagation(); setEditingAttrId(null); }} className="p-1.5 text-slate-400"><X size={16}/></button>
                        </div>
                      ) : (
                        <div className="flex gap-1 shrink-0 ml-2 opactiy-0 group-hover:opacity-100 transition-opacity">
                           <button onClick={(e) => { e.stopPropagation(); setEditingAttrId(attr.id); setEditingAttrName(attr.name); }} className="p-1.5 text-slate-400 hover:text-indigo-600"><Edit2 size={16}/></button>
                           <button onClick={(e) => { e.stopPropagation(); handleDeleteAttribute(attr.id); }} className="p-1.5 text-slate-400 hover:text-rose-500"><Trash2 size={16}/></button>
                        </div>
                      )}
                   </div>
                 ))}
                 {attributes.length === 0 && (
                    <div className="p-10 text-center text-slate-400 text-sm">Chưa có Nhóm Thuộc tính Nào</div>
                 )}
               </div>
           </div>

           {/* DETAIL PANEL: Attribute Values */}
           <div className="lg:col-span-7 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
               {selectedAttrId ? (
                 <>
                   <div className="p-5 bg-white border-b border-indigo-100 flex items-center justify-between">
                     <div>
                       <h2 className="font-bold text-slate-800 text-lg">Lựa chọn (Option) Detail</h2>
                       <p className="text-xs text-slate-500 mt-0.5">Giá trị của nhóm <span className="font-bold text-indigo-600 uppercase">[{attributes.find(x => x.id === selectedAttrId)?.name}]</span></p>
                     </div>
                   </div>
                   
                   <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                     {attrValues.map(val => (
                        <div key={val.id} className="border border-slate-200 rounded-xl p-3 flex justify-between items-center group hover:border-indigo-300 hover:shadow-sm transition-all bg-slate-50/50">
                           {editingValueId === val.id ? (
                              <input 
                                 autoFocus
                                 className="px-2 py-1 text-sm border border-indigo-400 focus:ring-2 focus:ring-indigo-50 outline-none rounded-md w-full mr-2 font-semibold"
                                 value={editingValueText}
                                 onChange={e => setEditingValueText(e.target.value)}
                                 onKeyDown={(e) => e.key === 'Enter' && handleUpdateAttrValue(val.id)}
                              />
                           ) : (
                              <span className="font-bold text-slate-700">{val.value}</span>
                           )}

                           {editingValueId === val.id ? (
                              <div className="flex shrink-0">
                                 <button onClick={() => handleUpdateAttrValue(val.id)} className="p-1.5 text-emerald-600"><Save size={16}/></button>
                                 <button onClick={() => setEditingValueId(null)} className="p-1.5 text-slate-400"><X size={16}/></button>
                              </div>
                           ) : (
                              <div className="flex shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <button onClick={() => { setEditingValueId(val.id); setEditingValueText(val.value); }} className="p-1.5 text-slate-400 hover:text-indigo-600"><Edit2 size={16}/></button>
                                 <button onClick={() => handleDeleteAttrValue(val.id)} className="p-1.5 text-slate-400 hover:text-rose-500"><Trash2 size={16}/></button>
                              </div>
                           )}
                        </div>
                     ))}
                     
                     {/* Bổ sung Khung tự thêm Options (Dành cho Cột Detail) */}
                     <form onSubmit={handleAddAttrValue} className="border-2 border-dashed border-indigo-200 bg-indigo-50/30 rounded-xl p-3 flex">
                         <input 
                           placeholder="Nhập option mới..."
                           value={newAttrValue}
                           onChange={e => setNewAttrValue(e.target.value)}
                           className="bg-transparent outline-none flex-1 text-sm font-semibold text-indigo-800 placeholder:text-indigo-300"
                         />
                         <button type="submit" className="text-indigo-600 font-bold px-2"><Plus size={20}/></button>
                     </form>
                   </div>
                 </>
               ) : (
                 <div className="p-20 text-center text-slate-400">
                    <Tags className="w-16 h-16 mx-auto mb-4 opacity-50 text-slate-300" />
                    <p className="font-semibold text-slate-600 mb-1">Cấu trúc Master-Detail</p>
                    <p className="text-sm">Vui lòng Click chọn một Nhóm bên tay trái<br />để xem và bổ sung các Giá Trị (Options) trực thuộc.</p>
                 </div>
               )}
           </div>
        </div>
      )}

    </div>
  );
};

export default AttributesConfig;

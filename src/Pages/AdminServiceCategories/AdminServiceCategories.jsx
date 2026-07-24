import React, { useState } from 'react';
import AdminSidebar from '../../Components/AdminSidebar/AdminSidebar';
import AdminHeader from '../../Components/AdminHeader/AdminHeader';
import './AdminServiceCategories.css';

const mockCategories = [
  {
    id: 1,
    title: 'Full Vehicle Service',
    description: 'Complete 120-point inspection covering engine, transmission,...',
    duration: '120 mins',
    price: 'Rs 25000.00',
    tag: 'PREMIUM CARE',
    image: '/assets/images/oil-change.jpg',
    active: true,
    hasLinkedBookings: true,
  },
  {
    id: 2,
    title: 'Engine Diagnostics',
    description: 'High-precision sensor calibration and ECU mapping to optimize fuel...',
    duration: '45 mins',
    price: 'Rs 45000.00',
    tag: 'PERFORMANCE',
    image: '/assets/images/engine-diagnostics.jpg',
    active: true,
    hasLinkedBookings: true,
  },
  {
    id: 3,
    title: 'Brake Optimization',
    description: 'Complete replacement or resurfacing of performance brake systems with...',
    duration: '90 mins',
    price: 'Rs 5500.00',
    tag: 'SAFETY',
    image: '/assets/images/brake-service.jpg',
    active: true,
  },
  {
    id: 4,
    title: 'Detailing & Polish',
    description: '3-stage paint correction followed by ceramic coating application for...',
    duration: '360 mins',
    price: 'Rs 30000.00',
    tag: 'OFFLINE',
    image: '/assets/images/car-wash.jpg',
    active: false,
  }
];

export default function AdminServiceCategories() {
  const [categories, setCategories] = useState(mockCategories);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMode, setToastMode] = useState('create');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingServiceId, setDeletingServiceId] = useState(null);
  
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '',
    price: '',
    image: '',
    active: true
  });

  const handleToggle = (id) => {
    setCategories(categories.map(c => c.id === id ? { ...c, active: !c.active } : c));
  };

  const handleOpenCreateModal = () => {
    setEditingServiceId(null);
    setFormData({ title: '', description: '', duration: '', price: '', image: '', active: true });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (service) => {
    setEditingServiceId(service.id);
    setFormData({
      title: service.title,
      description: service.description,
      duration: service.duration.replace(/\D/g, ''),
      price: service.price.replace(/[^\d.]/g, ''),
      image: service.image,
      active: service.active
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleCreateOrUpdateService = (e) => {
    e.preventDefault();
    if (editingServiceId !== null) {
      setCategories(categories.map(cat => cat.id === editingServiceId ? {
        ...cat,
        title: formData.title,
        description: formData.description,
        duration: `${formData.duration} mins`,
        price: formData.price ? `Rs ${parseFloat(formData.price).toFixed(2)}` : cat.price,
        active: formData.active
      } : cat));
      setToastMode('edit');
    } else {
      const newService = {
        id: Date.now(),
        title: formData.title,
        description: formData.description,
        duration: `${formData.duration} mins`,
        price: `Rs ${parseFloat(formData.price || 0).toFixed(2)}`,
        tag: 'GENERAL',
        image: formData.image || '/assets/images/oil-change.jpg',
        active: formData.active
      };
      setCategories([...categories, newService]);
      setToastMode('create');
    }
    
    setIsModalOpen(false);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleOpenDeleteModal = (id) => {
    setDeletingServiceId(id);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingServiceId(null);
  };

  const handleConfirmDelete = () => {
    const service = categories.find(c => c.id === deletingServiceId);
    if (service && service.hasLinkedBookings) {
      setCategories(categories.map(c => c.id === deletingServiceId ? { ...c, active: false } : c));
      setToastMode('archived');
    } else {
      setCategories(categories.filter(c => c.id !== deletingServiceId));
      setToastMode('deleted');
    }
    setIsDeleteModalOpen(false);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="admin-categories-layout">
      <AdminSidebar />
      
      <main className="categories-main-content">
        <AdminHeader searchPlaceholder="Search services..." />

        <div className="categories-scroll-area">
          <div className="categories-header">
            <div className="header-text">
              <h1>Service Categories</h1>
              <p>Manage your high-performance service catalog. Define pricing, durations, and availability for premium vehicle maintenance.</p>
            </div>
            <div className="header-actions">
              <button className="action-btn-outline">
                <svg fill="currentColor" viewBox="0 0 24 24"><path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/></svg>
                Filters
              </button>
              <button className="action-btn-outline">
                <svg fill="currentColor" viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
                Export Catalog
              </button>
            </div>
          </div>

          <div className="categories-grid">
            {categories.map((cat) => (
              <div className={`service-card ${!cat.active ? 'card-inactive' : ''}`} key={cat.id}>
                <div className="service-card-image" style={{ backgroundImage: `url(${cat.image})` }}>
                  <div className="service-card-overlay">
                    <span className="service-tag">{cat.tag}</span>
                  </div>
                </div>
                <div className="service-card-body">
                  <div className="service-title-row">
                    <h3>{cat.title}</h3>
                    <div 
                      className={`toggle-switch ${cat.active ? 'active' : ''}`}
                      onClick={() => handleToggle(cat.id)}
                    >
                      <div className="toggle-knob"></div>
                    </div>
                  </div>
                  <p className="service-desc">{cat.description}</p>
                  
                  <div className="service-footer">
                    <div className="service-meta">
                      <div className="meta-col">
                        <span className="meta-label">DURATION</span>
                        <span className="meta-value">{cat.duration}</span>
                      </div>
                      <div className="meta-col">
                        <span className="meta-label">STARTING</span>
                        <span className={`meta-value ${cat.active ? 'price-active' : ''}`}>{cat.price}</span>
                      </div>
                    </div>
                    <div className="card-actions-group">
                      <button className="edit-btn" onClick={() => handleOpenEditModal(cat)} aria-label="Edit Service">
                        <svg fill="currentColor" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                      </button>
                      <button className="delete-btn" onClick={() => handleOpenDeleteModal(cat.id)} aria-label="Delete Service">
                        <svg fill="currentColor" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zm2.46-7.12l1.41-1.41L12 12.59l2.12-2.12 1.41 1.41L13.41 14l2.12 2.12-1.41 1.41L12 15.41l-2.12 2.12-1.41-1.41L10.59 14l-2.13-2.12zM15.5 4l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="service-card add-new-card" onClick={handleOpenCreateModal}>
              <div className="add-new-content">
                <div className="add-icon-circle">
                  <svg fill="currentColor" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                </div>
                <h3>Add New Service</h3>
                <p>Expand your service portfolio</p>
              </div>
            </div>
          </div>

          </div>

        {/* Success Toast */}
        {showToast && (
          <div className="success-toast">
            <div className="toast-icon">
              <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <div className="toast-content">
              <h4>
                {toastMode === 'edit' ? 'Service Updated Successfully' : 
                 toastMode === 'create' ? 'Service Added Successfully' :
                 toastMode === 'deleted' ? 'Service Deleted Successfully' :
                 'Service Archived'}
              </h4>
              <p>
                {toastMode === 'edit' ? 'The service modifications have been saved.' : 
                 toastMode === 'create' ? 'Catalog has been updated with your new performance tier.' : 
                 toastMode === 'deleted' ? 'The service has been permanently removed.' :
                 'This service has booking history and was archived instead of permanently deleted.'}
              </p>
            </div>
          </div>
        )}
      </main>

      {/* New Service Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>{editingServiceId ? 'Edit Service Details' : 'New Service Details'}</h2>
                <p>{editingServiceId ? 'Update service specifications and pricing' : 'Setup service specifications and pricing'}</p>
              </div>
              <button className="modal-close-btn" onClick={handleCloseModal}>
                <svg fill="currentColor" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
              </button>
            </div>
            
            <form className="modal-form" onSubmit={handleCreateOrUpdateService}>
              <div className="form-group">
                <label>SERVICE NAME</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="e.g. ECU Remapping" required />
              </div>
              
              <div className="form-group">
                <label>DESCRIPTION</label>
                <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Describe the service benefits..." rows="4" required></textarea>
              </div>
              
              <div className="form-row">
                <div className="form-group half">
                  <label>DURATION (MINS)</label>
                  <input type="number" name="duration" value={formData.duration} onChange={handleChange} placeholder="60" required />
                </div>
                <div className="form-group half">
                  <label>STARTING PRICE ($)</label>
                  <input type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} placeholder="0.00" required />
                </div>
              </div>
              
              <div className="form-group">
                <label>SERVICE IMAGE</label>
                <div className="image-upload-area" style={formData.image && editingServiceId ? { backgroundImage: `url(${formData.image})`, backgroundSize: 'cover', backgroundPosition: 'center', borderColor: 'transparent' } : {}}>
                  {!formData.image || !editingServiceId ? (
                    <>
                      <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                      <span>Upload cinematic service visual</span>
                    </>
                  ) : (
                    <div style={{ backgroundColor: 'rgba(255,255,255,0.8)', padding: '6px 12px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                      Click to replace existing image
                    </div>
                  )}
                </div>
              </div>
              
              <div className="form-group form-active-toggle">
                <div>
                  <label>Active Status</label>
                  <p>Make service available immediately</p>
                </div>
                <div 
                  className={`toggle-switch ${formData.active ? 'active' : ''}`}
                  onClick={() => setFormData(p => ({ ...p, active: !p.active }))}
                >
                  <div className="toggle-knob"></div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={handleCloseModal}>Cancel</button>
                <button type="submit" className="btn-create">{editingServiceId ? 'Update Service' : 'Create Service'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="modal-overlay" onClick={handleCloseDeleteModal}>
          <div className="modal-container delete-confirmation-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2 style={{ color: '#E11D48' }}>Delete Service?</h2>
                <p>Are you sure you want to delete this service?<br/>This action cannot be undone.</p>
              </div>
              <button className="modal-close-btn" onClick={handleCloseDeleteModal}>
                <svg fill="currentColor" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
              </button>
            </div>
            <div className="modal-footer" style={{ padding: '0 30px 30px 30px' }}>
              <button type="button" className="btn-cancel" onClick={handleCloseDeleteModal}>Cancel</button>
              <button type="button" className="btn-create" style={{ backgroundColor: '#E11D48' }} onClick={handleConfirmDelete}>Delete Service</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react'
import { FaTwitter, FaGithub, FaDiscord, FaMedium, FaLink, FaTelegram, FaInstagram, FaNewspaper } from 'react-icons/fa'

interface EditProfileModalProps {
  isOpen: boolean
  onClose: () => void
  profile: any
  onSave: (data: any) => Promise<void>
}

export default function EditProfileModal({ isOpen, onClose, profile, onSave }: EditProfileModalProps) {
  const [formData, setFormData] = useState({
    username: profile?.username || '',
    bio: profile?.bio || '',
    social_links: {
      twitter: profile?.social_links?.twitter || '',
      github: profile?.social_links?.github || '',
      discord: profile?.social_links?.discord || '',
      medium: profile?.social_links?.medium || '',
      telegram: profile?.social_links?.telegram || '',
      instagram: profile?.social_links?.instagram || '',
      website: profile?.social_links?.website || '',
    }
  })
  const [isSaving, setIsSaving] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      await onSave(formData)
      onClose()
    } catch (error) {
      console.error('Error saving profile:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl mx-4">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Edit Profile</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            {/* Bio */}
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bio
              </label>
              <textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Social Links */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Social Links</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <FaTwitter className="w-5 h-5 text-blue-400" />
                  <input
                    type="url"
                    placeholder="Twitter URL"
                    value={formData.social_links.twitter}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      social_links: { ...prev.social_links, twitter: e.target.value }
                    }))}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <FaGithub className="w-5 h-5 text-gray-900 dark:text-white" />
                  <input
                    type="url"
                    placeholder="GitHub URL"
                    value={formData.social_links.github}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      social_links: { ...prev.social_links, github: e.target.value }
                    }))}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <FaDiscord className="w-5 h-5 text-indigo-500" />
                  <input
                    type="url"
                    placeholder="Discord URL"
                    value={formData.social_links.discord}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      social_links: { ...prev.social_links, discord: e.target.value }
                    }))}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <FaMedium className="w-5 h-5 text-gray-900 dark:text-white" />
                  <input
                    type="url"
                    placeholder="Medium URL"
                    value={formData.social_links.medium}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      social_links: { ...prev.social_links, medium: e.target.value }
                    }))}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <FaTelegram className="w-5 h-5 text-blue-400" />
                  <input
                    type="url"
                    placeholder="Telegram URL"
                    value={formData.social_links.telegram}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      social_links: { ...prev.social_links, telegram: e.target.value }
                    }))}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <FaInstagram className="w-5 h-5 text-pink-500" />
                  <input
                    type="url"
                    placeholder="Instagram URL"
                    value={formData.social_links.instagram}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      social_links: { ...prev.social_links, instagram: e.target.value }
                    }))}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <FaLink className="w-5 h-5 text-gray-500" />
                  <input
                    type="url"
                    placeholder="Website URL"
                    value={formData.social_links.website}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      social_links: { ...prev.social_links, website: e.target.value }
                    }))}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium text-black dark:text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 
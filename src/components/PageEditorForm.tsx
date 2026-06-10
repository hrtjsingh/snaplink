'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  buildCombinedHTML,
  isFormValid,
  parseCodeForSubmit,
  type EditorMode,
  type PageFormValues,
} from '@/lib/page-code'
import { DeletePageButton } from '@/components/DeletePageButton'
import {
  Code2,
  Upload,
  FileText,
  Globe,
  Lock,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Loader2,
  Settings,
  MonitorSpeaker,
  Smartphone,
  ExternalLink,
} from 'lucide-react'

interface PageEditorFormProps {
  mode: 'create' | 'edit'
  slug?: string
  initialData?: PageFormValues
  appUrl: string
}

const modeOptions = [
  {
    id: 'single' as const,
    icon: FileText,
    title: 'Single HTML File',
    description: 'Complete HTML with embedded CSS & JS',
    recommended: false,
  },
  {
    id: 'separate' as const,
    icon: Code2,
    title: 'Separate Editors',
    description: 'Individual HTML, CSS & JavaScript editors',
    recommended: true,
  },
  {
    id: 'upload' as const,
    icon: Upload,
    title: 'File Upload',
    description: 'Upload HTML, CSS & JS files',
    recommended: false,
  },
]

export default function PageEditorForm({
  mode,
  slug,
  initialData,
  appUrl,
}: PageEditorFormProps) {
  const router = useRouter()
  const isEdit = mode === 'edit'

  const [editorMode, setEditorMode] = useState<EditorMode>(
    isEdit ? 'separate' : 'single'
  )
  const [title, setTitle] = useState(initialData?.title ?? '')
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [visibility, setVisibility] = useState<'public' | 'private'>(
    initialData?.visibility ?? 'public'
  )
  const [pwaEnabled, setPwaEnabled] = useState(
    initialData?.pwaEnabled !== false
  )
  const [combinedHTML, setCombinedHTML] = useState(
    initialData ? buildCombinedHTML(initialData.html, initialData.css, initialData.js) : ''
  )
  const [html, setHtml] = useState(initialData?.html ?? '')
  const [css, setCss] = useState(initialData?.css ?? '')
  const [js, setJs] = useState(initialData?.js ?? '')
  const [isLoading, setIsLoading] = useState(false)

  const previewSlug =
    isEdit && slug
      ? slug
      : title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: string
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      if (type === 'html') setHtml(content)
      else if (type === 'css') setCss(content)
      else if (type === 'js') setJs(content)
      else if (type === 'combined') setCombinedHTML(content)
    }
    reader.readAsText(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { html: finalHtml, css: finalCss, js: finalJs } = parseCodeForSubmit(
        editorMode,
        { combinedHTML, html, css, js }
      )

      const payload = {
        title,
        description,
        html: finalHtml,
        css: finalCss,
        js: finalJs,
        visibility,
        pwaEnabled: visibility === 'public' ? pwaEnabled : false,
      }

      const response = await fetch(
        isEdit ? `/api/pages/${slug}` : '/api/pages',
        {
          method: isEdit ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      )

      if (!response.ok) {
        throw new Error(isEdit ? 'Failed to update page' : 'Failed to create page')
      }

      await response.json()
      toast.success(
        isEdit ? 'Changes saved successfully!' : 'Page published successfully!'
      )
      router.push('/dashboard')
    } catch (error) {
      console.error('Error saving page:', error)
      toast.error(
        isEdit
          ? 'Failed to save changes. Please try again.'
          : 'Failed to create page. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-fade-in-up">
              {isEdit ? 'Edit' : 'Create New'}
              <span className="snap-gradient-text-static"> Page</span>
            </h1>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              {isEdit
                ? 'Update your HTML, CSS, and JavaScript. Changes go live on the same link.'
                : 'Transform your code into a live web page with instant sharing and analytics'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <Card className="snap-card">
              <CardContent className="p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-cyan-500/15 rounded-lg flex items-center justify-center">
                    <Settings className="w-5 h-5 text-cyan-400" />
                  </div>
                  <h2 className="text-2xl text-white font-semibold">Page Information</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-3">
                        Page Title *
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="snap-input border rounded-lg"
                        placeholder="My Awesome Page"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-3">
                        Description
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="snap-input border rounded-lg resize-none"
                        rows={4}
                        placeholder="A brief description of your page"
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-3">
                        Visibility
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => setVisibility('public')}
                          className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                            visibility === 'public'
                              ? 'border-green-500 bg-green-500/10'
                              : 'border-white/10 hover:border-white/20'
                          }`}
                        >
                          <Globe className="w-6 h-6 mx-auto mb-2 text-green-400" />
                          <div className="font-medium text-white">Public</div>
                          <div className="text-xs text-zinc-400">Anyone with link can view</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setVisibility('private')
                            setPwaEnabled(false)
                          }}
                          className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                            visibility === 'private'
                              ? 'border-yellow-500 bg-yellow-500/10'
                              : 'border-white/10 hover:border-white/20'
                          }`}
                        >
                          <Lock className="w-6 h-6 mx-auto mb-2 text-yellow-400" />
                          <div className="font-medium text-white">Private</div>
                          <div className="text-xs text-zinc-400">Only you can access</div>
                        </button>
                      </div>
                    </div>

                    {(title || slug) && (
                      <div className="p-4 rounded-xl border border-white/10 bg-white/5">
                        <div className="text-sm text-zinc-400 mb-2">Live URL</div>
                        <div className="flex items-center gap-2">
                          <code className="min-w-0 flex-1 text-cyan-400 font-mono text-sm break-all">
                            {appUrl}/r/{previewSlug}
                          </code>
                          {isEdit && slug && (
                            <Link
                              href={`/r/${slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-400 transition-colors hover:border-cyan-500/30 hover:bg-cyan-500/10 hover:text-cyan-400"
                              aria-label="Visit live page"
                              title="Visit live page"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                          )}
                        </div>
                      </div>
                    )}

                    {visibility === 'public' && (
                      <button
                        type="button"
                        onClick={() => setPwaEnabled((v) => !v)}
                        className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                          pwaEnabled
                            ? 'border-cyan-500 bg-cyan-500/10'
                            : 'border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Smartphone className="w-6 h-6 text-cyan-400 shrink-0" />
                          <div>
                            <div className="font-medium text-white">
                              Installable as app (PWA)
                            </div>
                            <div className="text-xs text-zinc-400 mt-1">
                              Visitors can add this page to their home screen
                            </div>
                          </div>
                          <CheckCircle
                            className={`w-5 h-5 ml-auto shrink-0 ${
                              pwaEnabled ? 'text-cyan-400' : 'text-transparent'
                            }`}
                          />
                        </div>
                      </button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="snap-card">
              <CardContent className="p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-violet-500/15 rounded-lg flex items-center justify-center">
                    <Code2 className="w-5 h-5 text-violet-400" />
                  </div>
                  <h2 className="text-2xl text-white font-semibold">Code Editor</h2>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  {modeOptions.map((option) => {
                    const Icon = option.icon
                    const isSelected = editorMode === option.id
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setEditorMode(option.id)}
                        className={`relative p-6 rounded-xl border-2 transition-all duration-200 text-left ${
                          isSelected
                            ? 'border-cyan-500 bg-cyan-500/10'
                            : 'border-white/10 hover:border-white/20 hover:bg-white/5'
                        }`}
                      >
                        {option.recommended && (
                          <Badge className="absolute -top-2 -right-2 snap-badge">
                            <Sparkles className="w-3 h-3 mr-1" />
                            Recommended
                          </Badge>
                        )}
                        <Icon
                          className={`w-8 h-8 mb-4 ${
                            isSelected ? 'text-cyan-400' : 'text-zinc-400'
                          }`}
                        />
                        <h3 className="font-semibold text-white mb-2">{option.title}</h3>
                        <p className="text-sm text-zinc-400">{option.description}</p>
                        {isSelected && (
                          <CheckCircle className="absolute top-4 right-4 w-6 h-6 text-cyan-400" />
                        )}
                      </button>
                    )
                  })}
                </div>

                <div className="space-y-6">
                  {editorMode === 'single' && (
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-3">
                        Combined HTML (with &lt;style&gt; and &lt;script&gt; tags)
                      </label>
                      <div className="relative">
                        <textarea
                          value={combinedHTML}
                          onChange={(e) => setCombinedHTML(e.target.value)}
                          className="w-full h-96 px-4 py-4 snap-input border rounded-lg font-mono text-sm resize-none code-editor"
                          required={editorMode === 'single'}
                        />
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-white/10 text-zinc-300 border-white/10">
                            <MonitorSpeaker className="w-3 h-3 mr-1" />
                            HTML
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}

                  {editorMode === 'separate' && (
                    <div className="grid gap-6">
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-3">
                          HTML *
                        </label>
                        <textarea
                          value={html}
                          onChange={(e) => setHtml(e.target.value)}
                          className="w-full h-48 px-4 py-4 snap-input border rounded-lg font-mono text-sm resize-none code-editor"
                          placeholder="<div class='container'>...</div>"
                          required={editorMode === 'separate'}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-3">
                          CSS
                        </label>
                        <textarea
                          value={css}
                          onChange={(e) => setCss(e.target.value)}
                          className="w-full h-40 px-4 py-4 snap-input border rounded-lg font-mono text-sm resize-none code-editor"
                          placeholder="body { margin: 0; }"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-3">
                          JavaScript
                        </label>
                        <textarea
                          value={js}
                          onChange={(e) => setJs(e.target.value)}
                          className="w-full h-40 px-4 py-4 snap-input border rounded-lg font-mono text-sm resize-none code-editor"
                          placeholder="console.log('Hello');"
                        />
                      </div>
                    </div>
                  )}

                  {editorMode === 'upload' && (
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-zinc-300 mb-3">
                            HTML File *
                          </label>
                          <input
                            type="file"
                            accept=".html,.htm"
                            onChange={(e) => handleFileUpload(e, 'html')}
                            className="w-full snap-input border rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-600 file:text-white hover:file:bg-cyan-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-zinc-300 mb-3">
                            CSS File (Optional)
                          </label>
                          <input
                            type="file"
                            accept=".css"
                            onChange={(e) => handleFileUpload(e, 'css')}
                            className="w-full snap-input border rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-zinc-300 mb-3">
                            JavaScript File (Optional)
                          </label>
                          <input
                            type="file"
                            accept=".js"
                            onChange={(e) => handleFileUpload(e, 'js')}
                            className="w-full snap-input border rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-600 file:text-white hover:file:bg-yellow-700"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-3">
                          OR Combined HTML File
                        </label>
                        <div className="p-8 border-2 border-dashed border-white/10 rounded-lg text-center hover:border-cyan-500/40 transition-colors">
                          <Upload className="w-12 h-12 mx-auto mb-4 text-zinc-400" />
                          <input
                            type="file"
                            accept=".html,.htm"
                            onChange={(e) => handleFileUpload(e, 'combined')}
                            className="w-full snap-input border rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-600 file:text-white hover:file:bg-cyan-500"
                          />
                          <p className="text-sm text-zinc-400 mt-2">
                            Upload a complete HTML file with embedded CSS and JavaScript
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Button
                type="button"
                variant="glass"
                onClick={() => router.push('/dashboard')}
              >
                Cancel
              </Button>
              {isEdit && slug && (
                <DeletePageButton
                  slug={slug}
                  title={title || 'this page'}
                  variant="destructive"
                  size="default"
                />
              )}
              <Button
                type="submit"
                disabled={
                  isLoading ||
                  !isFormValid(editorMode, title, { combinedHTML, html })
                }
                size="lg"
                className="min-w-[220px] group"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    {isEdit ? 'Saving...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    {isEdit ? 'Save Changes' : 'Save & Get Link'}
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

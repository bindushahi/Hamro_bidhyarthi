import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Heart, MessageSquare, Search, Sparkles, Moon, Sun, X } from "lucide-react";

// ── helpers ───────────────────────────────────────────────────────────────────
const ANON_NAMES = [
  "Silent Sparrow","Wandering Cloud","Quiet Storm","Hidden Flame",
  "Lone Petal","Fading Echo","Gentle Ghost","Midnight Ink",
  "Nameless Star","Broken Compass","Soft Thunder","Paper Crane",
  "Hollow Moon","Dim Lantern","Pale Comet","Forgotten Song",
];

const TAGS = ["school","friends","family","feelings","secret","advice","rant","love","stress","other"];
const TAG_COLORS = {
  school: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  friends: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  family: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20",
  feelings: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  secret: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
  advice: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
  rant: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  love: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  stress: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
  other: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
};

function randomAnon() { return ANON_NAMES[Math.floor(Math.random() * ANON_NAMES.length)]; }
function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  return `${Math.floor(s/86400)}d ago`;
}

function TagPill({ tag }) {
  const cn = TAG_COLORS[tag] || TAG_COLORS.other;
  return (
    <Badge variant="outline" className={`font-semibold rounded-full px-3 py-0.5 ${cn} uppercase tracking-wider text-[10px] transition-colors border shadow-sm`}>
      {tag}
    </Badge>
  );
}

function CommentSection({ comments, onAdd }) {
  const [text, setText] = useState("");
  function submit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    onAdd({ author: randomAnon(), body: text.trim() });
    setText("");
  }
  return (
    <div className="mt-5 pt-4 border-t border-border/40 animate-slide-in">
      <ScrollArea className="max-h-56 pr-3">
        {comments.length === 0 ? (
          <p className="text-xs text-muted-foreground/60 italic my-2 text-center font-serif">No whispers yet. Add yours...</p>
        ) : (
          <div className="flex flex-col gap-4">
            {comments.map((c, i) => (
              <div key={i} className="flex gap-3 text-sm animate-slide-in" style={{ animationDelay: `${i * 0.05}s` }}>
                <Avatar className="w-7 h-7 border border-primary/10 bg-primary/5">
                  <AvatarFallback className="text-[10px] text-primary/70">{c.author[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1 bg-muted/30 p-3 rounded-2xl rounded-tl-none border border-border/40">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-foreground/70">{c.author}</span>
                    <span className="text-[10px] text-muted-foreground/60">{timeAgo(c.ts)}</span>
                  </div>
                  <p className="text-foreground/90 text-[13px] leading-relaxed">{c.body}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
      <form onSubmit={submit} className="flex gap-2 mt-4 relative">
        <input 
          className="bg-card/50 w-full h-10 border border-border/50 focus-visible:ring-1 focus-visible:ring-primary/40 focus:outline-none rounded-full pl-5 pr-[80px] text-[13px] shadow-sm transition-all" 
          value={text} 
          onChange={e => setText(e.target.value)} 
          placeholder="Reply anonymously..." 
        />
        <Button size="sm" type="submit" className="absolute right-1 top-1 bottom-1 h-8 rounded-full text-xs font-bold px-4 bg-primary text-primary-foreground hover:bg-primary/90 transition-transform active:scale-95">
          Send
        </Button>
      </form>
    </div>
  );
}

function PostCard({ post, onLike, onComment }) {
  const [open, setOpen] = useState(false);
  const liked = post.liked || false;

  return (
    <div className="rounded-[24px] border border-border/60 bg-card/60 backdrop-blur-3xl shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 transition-all duration-500 overflow-hidden flex flex-col group animate-slide-in relative">
      
      {/* Header */}
      <div className="pb-3 pt-6 px-6">
        <div className="flex justify-between items-start gap-4">
          <div className="flex items-center gap-3">
            <Avatar className="w-11 h-11 border-2 border-background shadow-sm bg-gradient-to-br from-primary/20 to-primary/5">
              <AvatarFallback className="font-bold text-primary font-serif">{post.author[0]}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-mono text-sm tracking-tight text-foreground/80 font-medium">{post.author}</span>
              <span className="text-[11px] font-medium text-muted-foreground/70">{timeAgo(post.ts)}</span>
            </div>
          </div>
          <TagPill tag={post.tag} />
        </div>
        <h3 className="text-[20px] font-bold font-serif leading-tight mt-5 text-foreground group-hover:text-primary transition-colors duration-300">
          {post.title}
        </h3>
      </div>
      
      {/* Content */}
      <div className="flex-1 pb-4 px-6 z-10">
        <p className={`text-foreground/80 text-[15px] leading-relaxed ${!open ? "line-clamp-3" : ""}`}>
          {post.body}
        </p>
        {post.body.length > 150 && (
          <button onClick={() => setOpen(o => !o)} className="text-primary hover:text-primary/70 text-[11px] font-bold mt-3 focus:outline-none flex items-center gap-1 transition-colors tracking-widest uppercase border border-primary/20 bg-primary/5 rounded-full px-3 py-1">
            {open ? "Read less" : "Read more"}
          </button>
        )}
      </div>

      {/* Footer */}
      <div className="pt-2 flex flex-col items-stretch gap-4 pb-6 px-6 relative z-10">
        <div className="flex gap-3">
          <button 
            onClick={() => onLike(post.id)}
            className={`flex items-center justify-center rounded-full h-[38px] px-4 text-[13px] font-bold gap-2 transition-all duration-300 border focus:outline-none ${liked ? "bg-red-500/10 border-red-500/30 text-red-500 hover:bg-red-500/20 hover:text-red-600 shadow-[0_0_15px_rgba(239,68,68,0.1)]" : "bg-muted/40 border-border/50 text-muted-foreground hover:bg-muted hover:text-foreground"}`}
          >
            <Heart className={`w-4 h-4 transition-transform ${liked ? "fill-red-500 animate-pulse-slow scale-110" : ""}`} />
            {post.likes}
          </button>
          <button 
            onClick={() => setOpen(o => !o)}
            className={`flex items-center justify-center rounded-full h-[38px] px-4 text-[13px] font-bold gap-2 transition-all duration-300 border focus:outline-none ${open ? "bg-primary/10 text-primary border-primary/30" : "bg-muted/40 border-border/50 text-muted-foreground hover:bg-muted hover:text-foreground"}`}
          >
            <MessageSquare className="w-4 h-4" />
            {post.comments.length}
          </button>
        </div>
        {open && <CommentSection comments={post.comments} onAdd={(c) => onComment(post.id, c)} />}
      </div>

      {/* Subtle bottom gradient sweep that appears on hover */}
      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-b-[24px]" />
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ConfessionBoard({ onClose }) {
  const [posts, setPosts] = useState([]);
  const [showNew, setShowNew] = useState(false);
  const [activeTag, setActiveTag] = useState("all");
  const [sort, setSort] = useState("new");
  const [search, setSearch] = useState("");
  
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tag, setTag] = useState("feelings");

  const [isDark, setIsDark] = useState(true);
  useEffect(() => {
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDark]);

  const [sessionId] = useState(() => {
    let sid = localStorage.getItem("confession_sid");
    if (!sid) {
      sid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem("confession_sid", sid);
    }
    return sid;
  });

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/confessions/?session_id=${sessionId}`)
      .then(res => res.json())
      .then(data => {
        const mapped = data.map(p => ({
            ...p,
            ts: new Date(p.created_at).getTime(),
            comments: p.comments.map(c => ({
                 ...c,
                 body: c.text,
                 ts: new Date(c.created_at).getTime()
            }))
        }));
        setPosts(mapped);
      })
      .catch(e => console.error(e));
  }, [sessionId]);

  async function handleNewPost(e) {
    if (e) e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    try {
      const res = await fetch("http://127.0.0.1:8000/api/confessions/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author: randomAnon(), title, body, tag })
      });
      if (res.ok) {
        const newPost = await res.json();
        const mappedPost = {
            ...newPost,
            ts: new Date(newPost.created_at).getTime(),
            liked: false,
            comments: []
        };
        setPosts(prev => [mappedPost, ...prev]);
        setShowNew(false);
        setTitle(""); setBody(""); setTag("feelings");
      }
    } catch(e) { console.error(e); }
  }

  async function handleLike(id) {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, likes: p.liked ? p.likes - 1 : p.likes + 1, liked: !p.liked } : p));
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/confessions/${id}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId })
      });
      if (res.ok) {
        const data = await res.json();
        setPosts(prev => prev.map(p => p.id === id ? { ...p, likes: data.likes, liked: data.liked } : p));
      }
    } catch(e) { console.error(e); }
  }

  async function handleComment(id, commentData) {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/confessions/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(commentData)
      });
      if (res.ok) {
        const c = await res.json();
        const mappedComment = {
            id: c.id,
            author: c.author,
            body: c.text,
            ts: new Date(c.created_at).getTime()
        };
        setPosts(prev => prev.map(p => p.id === id ? { ...p, comments: [...p.comments, mappedComment] } : p));
      }
    } catch(e) { console.error(e); }
  }

  const filtered = posts
    .filter(p => activeTag === "all" || p.tag === activeTag)
    .filter(p => !search.trim() || p.title.toLowerCase().includes(search.toLowerCase()) || p.body.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sort === "top" ? b.likes - a.likes : b.ts - a.ts);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-700 font-sans selection:bg-primary/30 selection:text-primary relative">
      
      {/* ── Ambient Orbs ── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 mix-blend-screen dark:mix-blend-lighten">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] md:w-[800px] md:h-[800px] rounded-full bg-indigo-500/10 dark:bg-indigo-600/15 blur-[100px] md:blur-[140px] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] md:w-[700px] md:h-[700px] rounded-full bg-pink-500/10 dark:bg-pink-600/10 blur-[100px] md:blur-[140px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-cyan-400/5 dark:bg-cyan-500/10 blur-[100px] animate-pulse-slow" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 flex flex-col lg:flex-row gap-8 lg:gap-12">
        
        {/* ── Left Sidebar ── */}
        <aside className="w-full lg:w-[320px] lg:shrink-0 flex flex-col gap-6 lg:sticky lg:top-10 h-fit">
          <div className="rounded-[32px] border border-border/50 bg-card/60 backdrop-blur-3xl shadow-2xl shadow-primary/5 p-2 transition-all">
            <div className="pb-4 pt-6 px-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50" />
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-[28px] font-black tracking-tighter text-foreground flex items-center gap-3 font-serif drop-shadow-sm">
                    <Sparkles className="w-7 h-7 text-primary animate-pulse-slow" /> Whispers
                  </h1>
                  <p className="text-[11px] text-muted-foreground/80 font-mono mt-1.5 uppercase tracking-[0.15em] font-bold">Anonymous Hub</p>
                </div>
                {onClose && (
                  <button onClick={onClose} className="rounded-full h-10 w-10 bg-muted/50 hover:bg-muted text-muted-foreground transition-all flex items-center justify-center border border-border/50">
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
            <div className="px-6 pb-6">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-background/80 rounded-2xl p-4 text-center border border-border/40 backdrop-blur-md shadow-sm">
                  <div className="text-3xl font-black text-foreground">{posts.length}</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-1.5 opacity-80">Posts</div>
                </div>
                <div className="bg-background/80 rounded-2xl p-4 text-center border border-border/40 backdrop-blur-md shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
                  <Heart className="absolute -right-2 -bottom-2 w-12 h-12 text-red-500/10 rotate-12" />
                  <div className="text-3xl font-black text-foreground relative z-10">{posts.reduce((a, p) => a + p.likes, 0)}</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-1.5 opacity-80 relative z-10">Hearts</div>
                </div>
              </div>
            </div>
          </div>

          <Dialog open={showNew} onOpenChange={setShowNew}>
            <DialogTrigger asChild>
              <button className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-xl shadow-primary/30 font-bold tracking-wide text-[16px] transition-all duration-300 active:scale-95 group relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                <span className="relative flex items-center gap-2">Drop a Confession</span>
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-card/90 backdrop-blur-3xl border border-border/60 rounded-[32px] p-8 shadow-2xl">
              <DialogHeader className="mb-4">
                <DialogTitle className="text-3xl font-black font-serif tracking-tight text-foreground">Leave your mark.</DialogTitle>
                <DialogDescription className="font-mono text-[11px] uppercase tracking-[0.15em] mt-2 text-primary uppercase font-bold">
                  No trace. No login. True anonymity.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleNewPost} className="space-y-6">
                <div>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-widest font-bold mb-3">Select Category</p>
                  <div className="flex flex-wrap gap-2">
                    {TAGS.map(tg => (
                      <button 
                        key={tg} 
                        type="button" 
                        onClick={() => setTag(tg)} 
                        className={`px-3.5 py-1.5 text-[11px] rounded-full border transition-all uppercase tracking-wider font-bold ${
                          tag === tg 
                            ? TAG_COLORS[tg] + " ring-2 ring-primary/30 ring-offset-2 ring-offset-background scale-[1.03] shadow-md" 
                            : "bg-muted/50 text-muted-foreground border-border/40 hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        {tg}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <input 
                    value={title} 
                    onChange={e => setTitle(e.target.value)} 
                    placeholder="Headline your thought..." 
                    maxLength={100}
                    className="w-full text-lg font-bold border border-border/40 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 rounded-2xl h-14 bg-background/50 backdrop-blur-xl px-5 shadow-inner transition-all placeholder:text-muted-foreground/50"
                  />
                  <textarea 
                    value={body} 
                    onChange={e => setBody(e.target.value)} 
                    placeholder="What's heavily weighing on your mind?" 
                    rows={6}
                    className="w-full resize-none text-[15px] leading-relaxed border border-border/40 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 rounded-2xl bg-background/50 backdrop-blur-xl p-5 shadow-inner transition-all placeholder:text-muted-foreground/50"
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={!title.trim() || !body.trim()}
                  className="w-full h-14 rounded-full bg-primary hover:bg-primary/90 font-bold text-lg shadow-xl shadow-primary/25 transition-all text-primary-foreground disabled:opacity-40 disabled:shadow-none flex items-center justify-center"
                >
                  Publish Confession
                </button>
              </form>
            </DialogContent>
          </Dialog>

          <div className="rounded-[32px] border border-border/50 bg-card/60 backdrop-blur-3xl shadow-xl shadow-primary/5 hidden lg:block overflow-hidden">
            <div className="pb-4 pt-6 px-6 bg-muted/20 border-b border-border/30">
              <h3 className="text-[11px] uppercase tracking-[0.15em] text-foreground font-bold flex items-center gap-2">
                <Search className="w-3.5 h-3.5" /> Explore Categories
              </h3>
            </div>
            <div className="flex flex-col gap-1.5 p-5">
              <button 
                onClick={() => setActiveTag("all")} 
                className={`w-full flex justify-between items-center rounded-xl h-11 px-4 transition-all focus:outline-none ${activeTag === "all" ? "bg-primary text-primary-foreground shadow-md font-bold" : "text-muted-foreground font-semibold hover:bg-muted hover:text-foreground border border-transparent hover:border-border/50"}`}
              >
                <span>All feeds</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${activeTag === "all" ? "bg-black/20 text-white" : "bg-muted-foreground/10 text-muted-foreground"}`}>
                  {posts.length}
                </span>
              </button>
              
              <div className="h-[1px] bg-border/40 my-2 mx-2" />

              {TAGS.map(tg => {
                const count = posts.filter(p => p.tag === tg).length;
                if (count === 0) return null;
                const isActive = activeTag === tg;
                return (
                  <button 
                    key={tg}
                    onClick={() => setActiveTag(tg)} 
                    className={`w-full flex justify-between items-center rounded-xl h-10 px-4 transition-all focus:outline-none ${isActive ? "bg-muted text-foreground font-bold shadow-sm border border-border/50" : "text-muted-foreground font-medium hover:bg-muted/50 hover:text-foreground border border-transparent"}`}
                  >
                    <span className="capitalize flex items-center gap-2 text-[13px]">
                      <span className={`w-2 h-2 rounded-full ${isActive ? "bg-primary" : "bg-muted-foreground/30"}`} />
                      {tg}
                    </span>
                    <span className="opacity-50 text-[11px] font-mono font-bold">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
          
          <button 
            onClick={() => setIsDark(!isDark)} 
            className="rounded-full h-12 border border-border/50 bg-card/50 backdrop-blur-lg shadow-sm hidden lg:flex items-center justify-center gap-3 text-muted-foreground hover:text-foreground transition-all hover:bg-muted font-bold focus:outline-none"
          >
            {isDark ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-indigo-500" />}
            Switch to {isDark ? "Light" : "Dark"} Mode
          </button>

        </aside>

        {/* ── Main Feed Content ── */}
        <main className="flex-1 max-w-3xl lg:max-w-none w-full flex flex-col pt-2 lg:pt-0">
          
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1 group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 group-focus-within:text-primary transition-colors" />
              <input 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
                placeholder="Search whispers..." 
                className="w-full pl-12 pr-6 h-[56px] focus:outline-none bg-card/60 backdrop-blur-2xl border border-border/50 rounded-full shadow-sm focus:border-primary/50 focus:ring-2 focus:ring-primary/20 text-[15px] transition-all hover:bg-card/80 font-medium placeholder:text-muted-foreground/60"
              />
            </div>
            <div className="flex bg-card/60 backdrop-blur-2xl border border-border/50 rounded-full p-1.5 shrink-0 h-[56px] shadow-sm items-center">
              <button 
                onClick={() => setSort("new")} 
                className={`rounded-full h-11 px-7 text-[14px] font-bold transition-all focus:outline-none ${sort === "new" ? "bg-primary shadow-lg shadow-primary/25 text-primary-foreground border-transparent" : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"}`}
              >
                New
              </button>
              <button 
                onClick={() => setSort("top")} 
                className={`rounded-full h-11 px-7 text-[14px] font-bold transition-all focus:outline-none ${sort === "top" ? "bg-primary shadow-lg shadow-primary/25 text-primary-foreground border-transparent" : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"}`}
              >
                Top
              </button>
            </div>
          </div>

          <div className="lg:hidden mb-6">
            <ScrollArea className="w-full whitespace-nowrap pb-3">
              <div className="flex gap-2 px-1">
                <button 
                  onClick={() => setActiveTag("all")} 
                  className={`rounded-full h-10 px-5 text-[13px] font-bold shadow-sm transition-all border focus:outline-none ${activeTag === "all" ? "bg-primary text-primary-foreground border-primary" : "bg-card/60 backdrop-blur-md border-border/50 text-foreground"}`}
                >
                  All feeds
                </button>
                {TAGS.map(tg => {
                  const count = posts.filter(p => p.tag === tg).length;
                  if (count === 0) return null;
                  return (
                    <button 
                      key={tg} 
                      onClick={() => setActiveTag(tg)} 
                      className={`rounded-full h-10 px-5 text-[13px] font-bold shadow-sm transition-all capitalize border focus:outline-none ${activeTag === tg ? "bg-primary text-primary-foreground border-primary" : "bg-card/60 backdrop-blur-md border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted/30"}`}
                    >
                      {tg}
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          <div className="flex flex-col gap-6">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 text-center animate-slide-in">
                <div className="w-24 h-24 bg-card/60 backdrop-blur-xl ring-1 ring-border/50 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-black/5">
                  <Moon className="w-10 h-10 text-muted-foreground/50" />
                </div>
                <h3 className="text-2xl font-black font-serif tracking-tight text-foreground drop-shadow-sm">A silent space</h3>
                <p className="text-muted-foreground text-[15px] mt-2 max-w-[280px] leading-relaxed font-medium">
                  Be the first to echo a whisper into this empty void.
                </p>
              </div>
            ) : filtered.map(post => (
              <PostCard key={post.id} post={post} onLike={handleLike} onComment={handleComment} />
            ))}
          </div>
          
          {filtered.length > 0 && (
            <div className="text-center mt-16 mb-12 flex items-center justify-center gap-4">
              <div className="h-[1px] w-12 bg-border/50" />
              <p className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold text-muted-foreground/30">End of records</p>
              <div className="h-[1px] w-12 bg-border/50" />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
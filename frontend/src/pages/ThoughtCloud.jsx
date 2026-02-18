import React, { useState, useEffect, useRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import axiosInstance from '../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const ThoughtCloud = () => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const [graphData, setGraphData] = useState({ nodes: [], links: [] });
    const fgRef = useRef();
    const containerRef = useRef();
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.offsetWidth,
                    height: containerRef.current.offsetHeight
                });
            }
        };

        window.addEventListener('resize', updateDimensions);
        updateDimensions();
        // Initial delay to ensure layout is done
        setTimeout(updateDimensions, 500);

        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    useEffect(() => {
        const fetchNotes = async () => {
            try {
                const response = await axiosInstance.get('/get-all-notes');
                if (response.data && response.data.notes) {
                    const notes = response.data.notes;
                    const tags = new Set();
                    notes.forEach(note => note.tags.forEach(tag => tags.add(tag)));

                    const nodes = [];
                    const links = [];

                    // Add Tags as nodes
                    tags.forEach(tag => {
                        nodes.push({ id: tag, name: tag, group: 'tag', val: 12, color: '#818cf8', textColor: '#e0e7ff' }); // Indigo
                    });

                    // Add Notes as nodes
                    notes.forEach(note => {
                        nodes.push({ id: note._id, name: note.title, group: 'note', val: 8, color: theme === 'dark' ? '#475569' : '#cbd5e1', textColor: theme === 'dark' ? '#f1f5f9' : '#1e293b' }); // Slate
                        note.tags.forEach(tag => {
                            links.push({ source: note._id, target: tag });
                        });
                    });

                    setGraphData({ nodes, links });
                }
            } catch (error) {
                console.error("Error fetching notes for graph:", error);
            }
        };

        fetchNotes();
    }, [theme]);

    const handleNodeClick = (node) => {
        if (node.group === 'note') {
            navigate(`/dashboard/note/${node.id}`);
        } else {
            fgRef.current.zoom(3, 1000);
            fgRef.current.centerAt(node.x, node.y, 1000);
        }
    };

    return (
        <div className="h-full w-full flex flex-col">
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">Thought Cloud</h1>
                    <p className="text-slate-500 dark:text-slate-400">Interactive visualization of your thought network.</p>
                </div>

                {/* Help Tooltip */}
                <div className="relative group mr-4">
                    <button className="p-2 text-slate-400 hover:text-primary-500 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                    </button>

                    <div className="absolute right-0 top-full mt-2 w-64 p-4 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-2 border-b border-slate-100 dark:border-slate-700 pb-2">How to Navigate</h3>
                        <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                            <li className="flex items-center gap-2">
                                <span className="bg-slate-100 dark:bg-slate-700 p-1 rounded">🖱️</span>
                                <span><strong>Click & Drag</strong> to Move View</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="bg-slate-100 dark:bg-slate-700 p-1 rounded">🔍</span>
                                <span><strong>Scroll</strong> or Pinch to Zoom</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="bg-slate-100 dark:bg-slate-700 p-1 rounded">👆</span>
                                <span><strong>Click Node</strong> to Focus / Open</span>
                            </li>
                        </ul>
                        <div className="absolute top-[-6px] right-3 w-3 h-3 bg-white dark:bg-slate-800 border-l border-t border-slate-200 dark:border-slate-700 transform rotate-45"></div>
                    </div>
                </div>
            </div>
            <div ref={containerRef} className="flex-1 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden relative min-h-[500px] shadow-inner">
                <ForceGraph2D
                    ref={fgRef}
                    width={dimensions.width}
                    height={dimensions.height}
                    graphData={graphData}
                    nodeLabel="name"
                    nodeColor="color"
                    nodeRelSize={6}

                    // Custom Node Rendering
                    nodeCanvasObject={(node, ctx, globalScale) => {
                        const label = node.name || 'Untitled';
                        const fontSize = 12 / globalScale;
                        ctx.font = `${fontSize}px Sans-Serif`;

                        // Draw Node Circle
                        ctx.beginPath();
                        ctx.arc(node.x, node.y, node.val, 0, 2 * Math.PI, false);
                        ctx.fillStyle = node.color;
                        ctx.fill();

                        // Draw Text Label below node
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillStyle = node.group === 'tag' ? (theme === 'dark' ? '#a5b4fc' : '#4f46e5') : (theme === 'dark' ? '#cbd5e1' : '#475569');
                        ctx.fillText(label, node.x, node.y + node.val + 2);
                    }}
                    nodeCanvasObjectMode={() => 'replace'}

                    linkWidth={1.5}
                    linkColor={() => theme === 'dark' ? 'rgba(148, 163, 184, 0.2)' : 'rgba(71, 85, 105, 0.2)'}
                    linkDirectionalParticles={2}
                    linkDirectionalParticleSpeed={0.005}
                    onNodeClick={handleNodeClick}
                    backgroundColor={theme === 'dark' ? '#0f172a' : '#f8fafc'}
                />
                {graphData.nodes.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                        <div className="text-center">
                            <p className="mb-2">No thoughts connected yet.</p>
                            <p className="text-xs">Create notes with tags to see your cloud grow!</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ThoughtCloud;

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  CircularProgress, 
  ToggleButtonGroup,
  ToggleButton,
  useMediaQuery,
  Chip,
  alpha,
  Alert,
  Fade,
  Tooltip,
  Slider,
  Button,
  useTheme as useMuiTheme,
  IconButton
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useMood } from '../../context/MoodContext';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import TimelineIcon from '@mui/icons-material/Timeline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import BiotechIcon from '@mui/icons-material/Biotech';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SettingsIcon from '@mui/icons-material/Settings';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ZoomInMapIcon from '@mui/icons-material/ZoomInMap';
import ZoomOutMapIcon from '@mui/icons-material/ZoomOutMap';

// Emotion types
interface EmotionNode {
  id: string;
  label: string;
  value: number;
  color: string;
  intensity: number;
  sourceIds: string[];
  targetIds: string[];
  biomarker?: {
    heartRate?: number;
    sleepQuality?: number;
    cortisol?: number;
  };
  x?: number;
  y?: number;
  selected?: boolean;
  hovered?: boolean;
}

interface EmotionLink {
  source: string;
  target: string;
  value: number;
  color?: string;
}

interface EmotionFlowData {
  nodes: EmotionNode[];
  links: EmotionLink[];
  timeframe: string;
  biomarkersEnabled: boolean;
}

// Mock biometric data - in real app this would come from wearable integrations
const getBiomarkerData = (mood: string) => {
  const baselines = {
    heartRate: 72,
    sleepQuality: 85,
    cortisol: 15
  };

  switch(mood) {
    case 'Very Bad': 
      return { 
        heartRate: baselines.heartRate + Math.floor(Math.random() * 15) + 10, 
        sleepQuality: baselines.sleepQuality - Math.floor(Math.random() * 30) - 20,
        cortisol: baselines.cortisol + Math.floor(Math.random() * 10) + 8
      };
    case 'Bad': 
      return {
        heartRate: baselines.heartRate + Math.floor(Math.random() * 10) + 5,
        sleepQuality: baselines.sleepQuality - Math.floor(Math.random() * 25) - 10,
        cortisol: baselines.cortisol + Math.floor(Math.random() * 7) + 4
      };
    case 'Okay': 
      return {
        heartRate: baselines.heartRate + Math.floor(Math.random() * 6) - 3,
        sleepQuality: baselines.sleepQuality + Math.floor(Math.random() * 10) - 5,
        cortisol: baselines.cortisol + Math.floor(Math.random() * 4) - 2
      };
    case 'Good': 
      return {
        heartRate: baselines.heartRate - Math.floor(Math.random() * 5) - 2,
        sleepQuality: baselines.sleepQuality + Math.floor(Math.random() * 12) + 5,
        cortisol: baselines.cortisol - Math.floor(Math.random() * 4) - 2
      };
    case 'Very Good': 
      return {
        heartRate: baselines.heartRate - Math.floor(Math.random() * 8) - 5,
        sleepQuality: baselines.sleepQuality + Math.floor(Math.random() * 15) + 8,
        cortisol: baselines.cortisol - Math.floor(Math.random() * 6) - 5
      };
    default:
      return {
        heartRate: baselines.heartRate,
        sleepQuality: baselines.sleepQuality,
        cortisol: baselines.cortisol
      };
  }
};

// Create sample data for testing
const createSampleData = (timeframe: string, biomarkersEnabled: boolean): EmotionFlowData => {
  const moodColors: Record<string, string> = {
    'Very Bad': '#E53935',  // Brighter red
    'Bad': '#FF9800',       // Orange
    'Okay': '#FFC107',      // Yellow
    'Good': '#8BC34A',      // Light green
    'Very Good': '#4CAF50'  // Green
  };

  // Generate nodes with connections
  const nodes: EmotionNode[] = [
    { 
      id: 'verybad', 
      label: 'Very Bad', 
      value: 2, 
      color: moodColors['Very Bad'],
      intensity: 0.8,
      sourceIds: [],
      targetIds: ['bad', 'okay'],
      ...(biomarkersEnabled && { biomarker: getBiomarkerData('Very Bad') })
    },
    { 
      id: 'bad', 
      label: 'Bad', 
      value: 3, 
      color: moodColors['Bad'],
      intensity: 0.7,
      sourceIds: ['verybad'],
      targetIds: ['okay'],
      ...(biomarkersEnabled && { biomarker: getBiomarkerData('Bad') })
    },
    { 
      id: 'okay', 
      label: 'Okay', 
      value: 5, 
      color: moodColors['Okay'],
      intensity: 0.6,
      sourceIds: ['verybad', 'bad'],
      targetIds: ['good', 'verygood'],
      ...(biomarkersEnabled && { biomarker: getBiomarkerData('Okay') })
    },
    { 
      id: 'good', 
      label: 'Good', 
      value: 4, 
      color: moodColors['Good'],
      intensity: 0.9,
      sourceIds: ['okay'],
      targetIds: ['verygood'],
      ...(biomarkersEnabled && { biomarker: getBiomarkerData('Good') })
    },
    { 
      id: 'verygood', 
      label: 'Very Good', 
      value: 3, 
      color: moodColors['Very Good'],
      intensity: 1.0,
      sourceIds: ['okay', 'good'],
      targetIds: [],
      ...(biomarkersEnabled && { biomarker: getBiomarkerData('Very Good') })
    }
  ];

  // Create links
  const links: EmotionLink[] = [];
  
  nodes.forEach(node => {
    node.targetIds.forEach(targetId => {
      const target = nodes.find(n => n.id === targetId);
      if (target) {
        links.push({
          source: node.id,
          target: targetId,
          value: Math.max(1, Math.min(node.value, target.value)),
          color: node.color
        });
      }
    });
  });

  return {
    nodes,
    links,
    timeframe,
    biomarkersEnabled
  };
};

// Main component (renamed for clarity but kept the export name the same)
const MoodFlowSankey: React.FC = () => {
  const { moodEntries } = useMood();
  const [timeFrame, setTimeFrame] = useState<string>('week');
  const [flowData, setFlowData] = useState<EmotionFlowData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));
  const [useSampleData, setUseSampleData] = useState<boolean>(false);
  const [showBiomarkers, setShowBiomarkers] = useState<boolean>(true);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // New state variables for enhanced functionality
  const [chartHeight, setChartHeight] = useState<number>(isMobile ? 300 : 500);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [showControls, setShowControls] = useState<boolean>(false);
  // New state for disabling animations
  const [disableAnimations, setDisableAnimations] = useState<boolean>(false);
  // Add a state for performance notification
  const [showPerformanceNotice, setShowPerformanceNotice] = useState<boolean>(false);
  // Add performance monitoring variables
  const frameRateRef = useRef<number[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number | null>(null);
  const [hasPerformanceIssues, setHasPerformanceIssues] = useState<boolean>(false);

  const moodColors: Record<string, string> = {
    'Very Bad': '#E53935',  // Brighter red
    'Bad': '#FF9800',       // Orange
    'Okay': '#FFC107',      // Yellow
    'Good': '#8BC34A',      // Light green
    'Very Good': '#4CAF50'  // Green
  };

  // Function to handle chart height adjustment
  const handleHeightChange = (event: Event, newValue: number | number[]) => {
    setChartHeight(newValue as number);
  };

  // Function to handle zoom level changes
  const handleZoomChange = (event: Event, newValue: number | number[]) => {
    setZoomLevel(newValue as number);
  };

  // Function to toggle control panel visibility
  const toggleControls = () => {
    setShowControls(prev => !prev);
  };

  // Function to reset visualization to default settings
  const resetVisualization = () => {
    setChartHeight(isMobile ? 300 : 500);
    setZoomLevel(1);
    setSelectedNode(null);
  };

  const handleTimeFrameChange = (event: React.MouseEvent<HTMLElement>, newTimeFrame: string) => {
    if (newTimeFrame !== null) {
      setTimeFrame(newTimeFrame);
    }
  };

  const toggleBiomarkers = () => {
    setShowBiomarkers(prev => !prev);
  };

  // Toggle animations on/off with notification
  const toggleAnimations = () => {
    const newValue = !disableAnimations;
    setDisableAnimations(newValue);
    
    // Show notification banner when user enables performance mode
    if (newValue) {
      // Check if we've shown the notice before
      const hasShownNotice = localStorage.getItem('performanceNoticeShown');
      if (!hasShownNotice) {
        setShowPerformanceNotice(true);
        // Set a timeout to auto-hide the notice after 10 seconds
        setTimeout(() => {
          setShowPerformanceNotice(false);
          localStorage.setItem('performanceNoticeShown', 'true');
        }, 10000);
      }
    }
  };

  // Filter entries based on time frame
  const filterEntriesByTimeFrame = (entries: any[]) => {
    const now = new Date();
    const cutoffDate = new Date();
    
    if (timeFrame === 'week') {
      cutoffDate.setDate(now.getDate() - 7);
    } else if (timeFrame === 'month') {
      cutoffDate.setMonth(now.getMonth() - 1);
    } else {
      // 'all' time frame - don't filter
      return entries;
    }
    
    return entries.filter(entry => new Date(entry.date) >= cutoffDate);
  };

  // Process mood entries to create flow data
  const processMoodEntries = useCallback(() => {
    if (useSampleData) {
      setFlowData(createSampleData(timeFrame, showBiomarkers));
      setLoading(false);
      setError(null);
      return;
    }

    if (moodEntries.length < 2) {
      setLoading(false);
      setFlowData(null);
      return;
    }

    try {
      setLoading(true);
      
      // Filter and sort entries
      const validEntries = moodEntries.filter(entry => entry && entry.date && entry.mood);
      const filteredEntries = filterEntriesByTimeFrame(validEntries);
      
      if (filteredEntries.length < 2) {
        setFlowData(null);
        setLoading(false);
        return;
      }
      
      const sortedEntries = [...filteredEntries].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      // Get unique moods
      const moodSet = new Set<string>();
      sortedEntries.forEach(entry => moodSet.add(entry.mood));
      const moods = Array.from(moodSet);

      // Create mood count and transitions
      const moodCounts: Record<string, number> = {};
      const transitions: Record<string, string[]> = {};
      
      moods.forEach(mood => {
        moodCounts[mood] = 0;
        transitions[mood] = [];
      });
      
      sortedEntries.forEach((entry, index) => {
        moodCounts[entry.mood]++;
        
        if (index < sortedEntries.length - 1) {
          const nextMood = sortedEntries[index + 1].mood;
          if (entry.mood !== nextMood) {
            transitions[entry.mood].push(nextMood);
          }
        }
      });
      
      // Create nodes for visualization
      const nodes: EmotionNode[] = moods.map(mood => {
        const moodId = mood.toLowerCase().replace(/\s+/g, '');
        
        // Find all moods that this mood transitions to
        const targetIds = Array.from(new Set(transitions[mood]))
          .map(targetMood => targetMood.toLowerCase().replace(/\s+/g, ''));
        
        // Find all moods that transition to this mood
        const sourceIds = moods
          .filter(sourceMood => transitions[sourceMood].includes(mood))
          .map(sourceMood => sourceMood.toLowerCase().replace(/\s+/g, ''));
        
        return {
          id: moodId,
          label: mood,
          value: moodCounts[mood],
          color: moodColors[mood] || '#888888',
          intensity: moodCounts[mood] / Math.max(...Object.values(moodCounts)),
          sourceIds,
          targetIds,
          ...(showBiomarkers && { biomarker: getBiomarkerData(mood) })
        };
      });
      
      // Create links
      const links: EmotionLink[] = [];
      
      nodes.forEach(node => {
        node.targetIds.forEach(targetId => {
          const target = nodes.find(n => n.id === targetId);
          if (target) {
          links.push({
              source: node.id,
              target: targetId,
              value: Math.max(1, Math.min(node.value, target.value)),
              color: node.color
            });
          }
        });
      });

      setFlowData({
        nodes,
        links,
        timeframe: timeFrame,
        biomarkersEnabled: showBiomarkers
      });
      
      setError(null);
      setLoading(false);
    } catch (err) {
      console.error("Error generating Emotion Flow data:", err);
      setError("Failed to generate mood flow visualization.");
      setFlowData(null);
      setLoading(false);
    }
  }, [moodEntries, timeFrame, useSampleData, showBiomarkers]);

  useEffect(() => {
    processMoodEntries();
  }, [processMoodEntries]);

  // Handle errors by switching to sample data
  const handleUseSampleData = () => {
    setUseSampleData(true);
  };

  // Handle node selection
  const handleNodeClick = (nodeId: string) => {
    setSelectedNode(prev => prev === nodeId ? null : nodeId);
  };

  // Updated calculateNodePositions to account for zoom level
  const calculateNodePositions = useCallback(() => {
    if (!flowData || !containerRef.current) return;
    
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = chartHeight;
    const centerX = containerWidth / 2;
    const centerY = containerHeight / 2;
    
    // Radius proportional to container size and zoom level
    const radius = Math.min(containerWidth, containerHeight) * 0.35 * zoomLevel;
    
    // Update node positions
    const updatedNodes = flowData.nodes.map((node, index) => {
      const angleStep = (2 * Math.PI) / flowData.nodes.length;
      const angle = index * angleStep;
      
      return {
        ...node,
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        selected: node.id === selectedNode,
        hovered: node.id === hoveredNode
      };
    });
    
    setFlowData(prev => prev ? {...prev, nodes: updatedNodes} : null);
  }, [flowData, selectedNode, hoveredNode, chartHeight, zoomLevel]);

  // Update positions when container size changes
  useEffect(() => {
    if (!containerRef.current) return;
    
    const resizeObserver = new ResizeObserver(() => {
      calculateNodePositions();
    });
    
    resizeObserver.observe(containerRef.current);
    
    return () => {
      resizeObserver.disconnect();
    };
  }, [calculateNodePositions]);

  // Update positions when data changes
  useEffect(() => {
    calculateNodePositions();
  }, [flowData?.nodes.length, selectedNode, hoveredNode, calculateNodePositions, chartHeight, zoomLevel]);
  
  // Enhanced renderSvgVisualization function
  const renderSvgVisualization = () => {
    if (!flowData || !flowData.nodes.length) return null;
    
    return (
      <svg 
        ref={svgRef}
        width="100%" 
        height="100%" 
        style={{ 
          overflow: 'visible',
          transform: `scale(${zoomLevel})`,
          transformOrigin: 'center center'
        }}
        role="img"
        aria-label="Mood Flow Visualization"
        // Add touch event handlers for better mobile interaction
        onTouchStart={() => {
          // Reset any stuck animations or interactions on touch
          if (disableAnimations) {
            setSelectedNode(null);
            setHoveredNode(null);
          }
        }}
      >
        <defs>
          {/* Enhanced gradient definitions for links */}
          {flowData.links.map((link, index) => {
            const source = flowData.nodes.find(n => n.id === link.source);
            const target = flowData.nodes.find(n => n.id === link.target);
            
            if (!source || !target || !source.x || !source.y || !target.x || !target.y) return null;
            
            return (
              <linearGradient 
                key={`gradient-${index}`}
                id={`gradient-${source.id}-${target.id}`}
                x1={source.x} 
                y1={source.y} 
                x2={target.x} 
                y2={target.y} 
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor={source.color} stopOpacity="0.9" />
                <stop offset="100%" stopColor={target.color} stopOpacity="0.9" />
              </linearGradient>
            );
          })}
          
          {/* Only include filters if animations are enabled */}
          {!disableAnimations && (
            <>
              <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>

              <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="rgba(0,0,0,0.2)" />
              </filter>
            </>
          )}
        </defs>
        
        {/* Enhanced background with subtle grain effect */}
        <rect 
          x="0" 
          y="0" 
          width="100%" 
          height="100%" 
          fill="#f8f9fa" 
          rx="16" 
          ry="16"
          filter={!disableAnimations ? "url(#shadow)" : "none"}
        />
        <rect 
          x="0" 
          y="0" 
          width="100%" 
          height="100%" 
          fill="url(#noise)" 
          fillOpacity="0.03" 
          rx="16" 
          ry="16"
        />
        
        {/* Links with enhanced styling */}
        <g className="links">
          {flowData.links.map((link, index) => {
            const source = flowData.nodes.find(n => n.id === link.source);
            const target = flowData.nodes.find(n => n.id === link.target);
            
            if (!source || !target || !source.x || !source.y || !target.x || !target.y) return null;
            
            // Calculate control point for curved links
            const controlX = (source.x + target.x) / 2;
            const controlY = (source.y + target.y) / 2 - 70 * zoomLevel; // Adjust for curve height
            
            // Thickness based on value
            const strokeWidth = Math.max(2, Math.min(10, link.value * 1.8));
            
            // Highlight if connected to selected node
            const isHighlighted = source.id === selectedNode || target.id === selectedNode;
            
            return (
              <path
                key={`link-${index}`}
                d={`M ${source.x} ${source.y} Q ${controlX} ${controlY} ${target.x} ${target.y}`}
                stroke={`url(#gradient-${source.id}-${target.id})`}
                strokeWidth={strokeWidth}
                fill="none"
                strokeLinecap="round"
                opacity={isHighlighted ? 1 : 0.7}
                filter={isHighlighted && !disableAnimations ? "url(#glow)" : "none"}
                className="mood-link"
              />
            );
          })}
        </g>
        
        {/* Nodes with enhanced styling */}
        <g className="nodes">
          {flowData.nodes.map((node) => {
            if (!node.x || !node.y) return null;
            
            // Node size based on value and zoom level
            const nodeSize = (25 + (node.value * 10)) * Math.sqrt(zoomLevel);
            const isSelected = node.id === selectedNode;
            const isHovered = node.id === hoveredNode;
            const isFocused = isSelected || isHovered;
            
    return (
              <g 
                key={`node-${node.id}`}
                transform={`translate(${node.x}, ${node.y})`}
                onClick={() => handleNodeClick(node.id)}
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => !disableAnimations && setHoveredNode(node.id)}
                onMouseLeave={() => !disableAnimations && setHoveredNode(null)}
                onTouchStart={() => !disableAnimations && setHoveredNode(node.id)}
                onTouchEnd={() => !disableAnimations && setHoveredNode(null)}
              >
                {/* Enhanced glow effect for selected/hovered node - only if animations enabled */}
                {isFocused && !disableAnimations && (
                  <circle
                    r={nodeSize + 12}
                    fill={alpha(node.color, 0.4)}
                    filter="url(#glow)"
                  />
                )}
                
                {/* Node circle with enhanced styling */}
                <circle
                  r={nodeSize}
                  fill={alpha(node.color, 0.95)}
                  stroke={node.color}
                  strokeWidth={3}
                  className="node-circle"
                  filter={!disableAnimations ? "url(#shadow)" : "none"}
                />
                
                {/* Enhanced pulse animation for selected node - with limited repetitions */}
                {isSelected && !disableAnimations && (
                  <>
                    <circle
                      r={nodeSize + 5}
                      fill="none"
                      stroke={node.color}
                      strokeWidth={2}
                      opacity={0.6}
                      className="pulse-ring-outer"
                    >
                      <animate
                        attributeName="r"
                        from={nodeSize + 5}
                        to={nodeSize + 20}
                        dur="2s"
                        begin="0s"
                        repeatCount="3"
                      />
                      <animate
                        attributeName="opacity"
                        from="0.6"
                        to="0"
                        dur="2s"
                        begin="0s"
                        repeatCount="3"
                      />
                    </circle>
                    <circle
                      r={nodeSize + 2}
                      fill="none"
                      stroke={node.color}
                      strokeWidth={2}
        opacity={0.7}
                      className="pulse-ring-inner"
                    >
                      <animate
                        attributeName="r"
                        from={nodeSize + 2}
                        to={nodeSize + 12}
                        dur="1.5s"
                        begin="0.3s"
                        repeatCount="3"
                      />
                      <animate
                        attributeName="opacity"
                        from="0.7"
                        to="0"
                        dur="1.5s"
                        begin="0.3s"
                        repeatCount="3"
                      />
                    </circle>
                  </>
                )}
                
                {/* Enhanced node label with better visibility */}
                <text
                  dy=".3em"
                  textAnchor="middle"
                  fill="#fff"
                  fontWeight="bold"
                  fontSize={16}
                  style={{ 
                    textShadow: !disableAnimations ? '0px 1px 3px rgba(0,0,0,0.5)' : 'none',
                    pointerEvents: 'none'
                  }}
                >
                  {node.label}
                </text>
                
                {/* Value indicator with better visibility */}
                <text
                  dy="1.6em"
                  textAnchor="middle"
                  fill={alpha('#fff', 0.95)}
                  fontSize={14}
                  fontWeight="medium"
                  style={{ 
                    pointerEvents: 'none',
                    textShadow: !disableAnimations ? '0px 1px 2px rgba(0,0,0,0.3)' : 'none'
                  }}
                >
                  {node.value}
                </text>
                
                {/* Enhanced biomarker indicators */}
                {showBiomarkers && node.biomarker && (
                  <>
                    {node.biomarker.heartRate && (
                      <g transform={`translate(${nodeSize * 0.8}, ${-nodeSize * 0.8})`}>
                        <circle
                          r={16}
                          fill="#ff5252"
                          filter="url(#shadow)"
                          className="biomarker-indicator"
                        />
                        <text
                          textAnchor="middle"
                          fill="#fff"
                          fontSize={11}
                          fontWeight="bold"
                          dy=".3em"
                          style={{ textShadow: '0px 1px 2px rgba(0,0,0,0.3)' }}
                        >
                          {node.biomarker.heartRate}
                        </text>
                      </g>
                    )}
                    
                    {node.biomarker.sleepQuality && (
                      <g transform={`translate(${-nodeSize * 0.8}, ${-nodeSize * 0.8})`}>
                        <circle
                          r={16}
                          fill="#3f51b5"
                          filter="url(#shadow)"
                          className="biomarker-indicator"
                        />
                        <text
                          textAnchor="middle"
                          fill="#fff"
                          fontSize={11}
                          fontWeight="bold"
                          dy=".3em"
                          style={{ textShadow: '0px 1px 2px rgba(0,0,0,0.3)' }}
                        >
                          {node.biomarker.sleepQuality}
                        </text>
                      </g>
                    )}
                    
                    {node.biomarker.cortisol && (
                      <g transform={`translate(0, ${-nodeSize * 1.2})`}>
                        <circle
                          r={16}
                          fill="#9c27b0"
                          filter="url(#shadow)"
                          className="biomarker-indicator"
                        />
                        <text
                          textAnchor="middle"
                          fill="#fff"
                          fontSize={11}
                          fontWeight="bold"
                          dy=".3em"
                          style={{ textShadow: '0px 1px 2px rgba(0,0,0,0.3)' }}
                        >
                          {node.biomarker.cortisol}
                        </text>
                      </g>
                    )}
                  </>
                )}
              </g>
            );
          })}
        </g>
        
        {/* Enhanced legend for biomarkers */}
        {showBiomarkers && (
          <g transform="translate(20, 20)" filter="url(#shadow)">
            <rect
              x="0"
              y="0"
              width="180"
              height="90"
              fill="rgba(255, 255, 255, 0.9)"
              rx="12"
              ry="12"
              stroke="#ddd"
              strokeWidth="1"
            />
            
            <text x="10" y="20" fontSize="13" fontWeight="bold" fill="#333">
              Biomarker Legend:
            </text>
            
            <circle cx="20" cy="40" r="8" fill="#ff5252" />
            <text x="35" y="44" fontSize="12" fill="#333">Heart Rate (bpm)</text>
            
            <circle cx="20" cy="65" r="8" fill="#3f51b5" />
            <text x="35" y="69" fontSize="12" fill="#333">Sleep Quality (%)</text>
          </g>
        )}
      </svg>
    );
  };

  // Legend and info for selected node
  const renderNodeInfo = () => {
    if (!flowData || !selectedNode) return null;
    
    const node = flowData.nodes.find(n => n.id === selectedNode);
    if (!node) return null;
    
      return (
      <Fade in>
        <Box
          sx={{
            mt: 3, 
            p: 3,
            backgroundColor: alpha(node.color, 0.05),
            borderLeft: `4px solid ${node.color}`,
            borderRadius: 2,
            boxShadow: 'var(--shadow-sm)',
            backdropFilter: 'blur(8px)'
          }}
        >
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            {node.label} Mood Analysis
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
              Occurrences:
            </Typography>
            <Chip 
              label={node.value} 
              size="small" 
              sx={{ 
                backgroundColor: alpha(node.color, 0.2),
                color: 'text.primary',
                fontWeight: 'bold'
              }} 
            />
          </Box>
          
          {showBiomarkers && node.biomarker && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                Biometric Correlations:
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 1 }}>
                {node.biomarker.heartRate && (
                  <Chip 
                    icon={<MonitorHeartIcon sx={{ color: '#ff5252 !important' }} />}
                    label={`Heart Rate: ${node.biomarker.heartRate} bpm`}
                    size="small"
                    sx={{ 
                      backgroundColor: alpha('#ff5252', 0.1),
                      color: 'text.primary'
                    }}
                  />
                )}
                
                {node.biomarker.sleepQuality && (
                  <Chip 
                    icon={<AccessTimeIcon sx={{ color: '#3f51b5 !important' }} />}
                    label={`Sleep Quality: ${node.biomarker.sleepQuality}%`}
                    size="small"
                    sx={{ 
                      backgroundColor: alpha('#3f51b5', 0.1),
                      color: 'text.primary'
                    }}
                  />
                )}
                
                {node.biomarker.cortisol && (
                  <Chip 
                    icon={<BiotechIcon sx={{ color: '#9c27b0 !important' }} />}
                    label={`Stress Level: ${node.biomarker.cortisol} units`}
                    size="small"
                    sx={{ 
                      backgroundColor: alpha('#9c27b0', 0.1),
                      color: 'text.primary'
                    }}
                  />
                )}
              </Box>
            </Box>
          )}
          
          <Box sx={{ display: 'flex', gap: 3 }}>
            {/* Emotions that lead to this mood */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                <ArrowBackIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                Coming from:
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                {node.sourceIds.length > 0 ? (
                  node.sourceIds.map(sourceId => {
                    const sourceNode = flowData.nodes.find(n => n.id === sourceId);
                    return sourceNode ? (
                      <Chip 
                        key={sourceId}
                        label={sourceNode.label}
                        size="small"
                        sx={{ 
                          backgroundColor: alpha(sourceNode.color, 0.2),
                          color: 'text.primary'
                        }}
                        onClick={() => handleNodeClick(sourceId)}
                      />
                    ) : null;
                  })
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Initial mood state
                  </Typography>
                )}
              </Box>
            </Box>
            
            {/* Emotions this mood leads to */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                Leads to:
                <ArrowForwardIcon fontSize="small" sx={{ verticalAlign: 'middle', ml: 0.5 }} />
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                {node.targetIds.length > 0 ? (
                  node.targetIds.map(targetId => {
                    const targetNode = flowData.nodes.find(n => n.id === targetId);
                    return targetNode ? (
                      <Chip 
                        key={targetId}
                        label={targetNode.label}
                        size="small"
                        sx={{ 
                          backgroundColor: alpha(targetNode.color, 0.2),
                          color: 'text.primary'
                        }}
                        onClick={() => handleNodeClick(targetId)}
                      />
                    ) : null;
                  })
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Final mood state
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
          
          {/* AI-generated insights - 2025 feature */}
          <Box sx={{ mt: 3, p: 2, backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 2 }}>
            <Typography variant="subtitle2" fontWeight="bold" color="primary" gutterBottom>
              <BiotechIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
              AI Insight
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {node.label === 'Very Bad' && 'This intense mood state appears connected to sleep quality issues. Consider trying our guided meditation before bed.'}
              {node.label === 'Bad' && 'When you feel this way, your biometrics show increased stress levels. Physical activity might help reduce these feelings.'}
              {node.label === 'Okay' && 'This neutral state often transitions to more positive moods. Morning journaling could help maintain this momentum.'}
              {node.label === 'Good' && 'Your sleep quality tends to be better when you\'re in this mood state. Consider what activities led to this feeling.'}
              {node.label === 'Very Good' && 'Your heart rate is lower and stress hormones decrease in this state. This mood correlates with better overall health metrics.'}
            </Typography>
          </Box>
        </Box>
      </Fade>
    );
  };

  // Check for performance issues when component mounts
  useEffect(() => {
    // Skip if animations are already disabled
    if (disableAnimations) return;
    
    // Check if we have a stored preference
    const storedMode = localStorage.getItem('disableAnimations');
    if (storedMode === 'true') {
      setDisableAnimations(true);
      return;
    }
    
    // Monitor frame rate for a few seconds to detect performance issues
    let frameCount = 0;
    
    const checkFrameRate = (timestamp: number) => {
      if (lastFrameTimeRef.current !== null) {
        const deltaTime = timestamp - lastFrameTimeRef.current;
        const fps = 1000 / deltaTime;
        
        // Store last 10 FPS readings
        frameRateRef.current.push(fps);
        if (frameRateRef.current.length > 10) {
          frameRateRef.current.shift();
        }
        
        // After collecting enough samples, check if performance is poor
        if (frameCount > 30) {
          // Calculate average FPS
          const avgFps = frameRateRef.current.reduce((sum, fps) => sum + fps, 0) / 
                         frameRateRef.current.length;
          
          // If average FPS is below 30, consider it a performance issue
          if (avgFps < 30) {
            setHasPerformanceIssues(true);
            setDisableAnimations(true);
            setShowPerformanceNotice(true);
            
            // Auto-hide the notice after 10 seconds
            setTimeout(() => {
              setShowPerformanceNotice(false);
            }, 10000);
            
            // Remember this setting
            localStorage.setItem('disableAnimations', 'true');
            localStorage.setItem('performanceIssueDetected', 'true');
            
            // Stop monitoring
            return;
          }
        }
      }
      
      lastFrameTimeRef.current = timestamp;
      frameCount++;
      
      // Continue monitoring for up to 3 seconds (180 frames at 60fps)
      if (frameCount < 180) {
        animationFrameRef.current = requestAnimationFrame(checkFrameRate);
      }
    };
    
    // Start monitoring
    animationFrameRef.current = requestAnimationFrame(checkFrameRate);
    
    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Save animation preference when it changes
  useEffect(() => {
    localStorage.setItem('disableAnimations', disableAnimations.toString());
  }, [disableAnimations]);

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        borderRadius: 4,
        overflow: 'hidden',
        background: '#ffffff',
        p: 3,
        boxShadow: 'var(--shadow-lg)'
      }}
    >
      {/* Performance mode notice */}
      {showPerformanceNotice && (
        <Alert 
          severity="info" 
          sx={{ mb: 2 }}
          onClose={() => setShowPerformanceNotice(false)}
        >
          Performance mode enabled. Animations are reduced to improve responsiveness and battery life.
          You can toggle this setting anytime in the controls or in Settings.
        </Alert>
      )}
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography 
          variant="h5" 
          fontWeight="bold"
          sx={{ color: 'text.primary' }}
        >
          Interactive Mood Flow
        </Typography>
        
        <ToggleButtonGroup
            value={timeFrame}
          exclusive
            onChange={handleTimeFrameChange}
          aria-label="time frame"
          size="small"
        >
          <ToggleButton value="week">Week</ToggleButton>
          <ToggleButton value="month">Month</ToggleButton>
          <ToggleButton value="all">All</ToggleButton>
        </ToggleButtonGroup>
      </Box>
      
      {error && (
        <Alert 
          severity="error"
          sx={{ mb: 2 }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={handleUseSampleData}
            >
              Use Sample Data
            </Button>
          }
        >
          {error}
        </Alert>
      )}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      ) : !flowData ? (
        <Box sx={{ p: 5, textAlign: 'center' }}>
          <Typography variant="body1" paragraph>
            Not enough data to visualize mood flow.
          </Typography>
          <Button 
            variant="outlined" 
            startIcon={<TimelineIcon />}
            onClick={handleUseSampleData}
          >
            View Sample Visualization
          </Button>
        </Box>
      ) : (
        <Box>
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 2,
              gap: 2,
              flexWrap: 'wrap'
            }}
          >
            {/* Enhanced controls */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Toggle biometric data">
                <ToggleButton
                  value="biomarkers"
                  selected={showBiomarkers}
                  onChange={toggleBiomarkers}
                  size="small"
                >
                  <BiotechIcon fontSize="small" />
                </ToggleButton>
              </Tooltip>
              
              <Tooltip title="Adjust visualization settings">
                <ToggleButton
                  value="settings"
                  selected={showControls}
                  onChange={toggleControls}
                  size="small"
                >
                  <SettingsIcon fontSize="small" />
                </ToggleButton>
              </Tooltip>
              
              <Tooltip title="Toggle animations (improve performance)">
                <ToggleButton
                  value="animations"
                  selected={!disableAnimations}
                  onChange={toggleAnimations}
                  size="small"
                  color="error"
                >
                  {disableAnimations ? <ZoomInMapIcon fontSize="small" /> : <ZoomOutMapIcon fontSize="small" />}
                </ToggleButton>
              </Tooltip>
              
              <Tooltip title="Reset visualization">
                <IconButton onClick={resetVisualization} size="small">
                  <ZoomOutMapIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          
          {/* New controls panel */}
          <Fade in={showControls}>
            <Box 
              sx={{ 
                mb: 2, 
                p: 2, 
                backgroundColor: alpha(theme.palette.background.paper, 0.7),
                borderRadius: 2,
                backdropFilter: 'blur(8px)',
                display: showControls ? 'flex' : 'none',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 3,
                alignItems: 'center'
              }}
            >
              <Box sx={{ width: { xs: '100%', sm: '45%' } }}>
                <Typography variant="body2" id="chart-height-slider" gutterBottom fontWeight="medium">
                  Chart Height: {chartHeight}px
                </Typography>
                <Slider
                  value={chartHeight}
                  min={200}
                  max={800}
                  step={50}
                  onChange={handleHeightChange as any}
                  aria-labelledby="chart-height-slider"
                  sx={{ color: theme.palette.primary.main }}
                />
              </Box>
              
              <Box sx={{ width: { xs: '100%', sm: '45%' } }}>
                <Typography variant="body2" id="zoom-slider" gutterBottom fontWeight="medium">
                  Zoom Level: {zoomLevel.toFixed(1)}x
                </Typography>
                <Slider
                  value={zoomLevel}
                  min={0.5}
                  max={2}
                  step={0.1}
                  onChange={handleZoomChange as any}
                  aria-labelledby="zoom-slider"
                  sx={{ color: theme.palette.primary.main }}
                />
              </Box>
            </Box>
          </Fade>
          
          <Box 
            ref={containerRef}
            sx={{ 
              width: '100%', 
              height: chartHeight,
              position: 'relative',
              bgcolor: '#f8f9fa',
              borderRadius: 3,
              overflow: 'hidden',
              border: '1px solid rgba(0,0,0,0.08)',
              transition: disableAnimations ? 'none' : 'height 0.3s ease-in-out',
              boxShadow: disableAnimations ? 'none' : 'inset 0 0 20px rgba(0,0,0,0.03)'
            }}
          >
            {renderSvgVisualization()}
          </Box>
          
          {renderNodeInfo()}
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              Visualization Guide:
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Typography variant="body2" color="text.secondary">
                • Circle size represents frequency of mood occurrence
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Connected arcs show mood transitions
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Click on a mood to see detailed information
              </Typography>
              {showBiomarkers && (
                <Typography variant="body2" color="text.secondary">
                  • Smaller circles show biometric correlations
                </Typography>
              )}
              <Typography variant="body2" color="text.secondary">
                • Use the controls to adjust size and zoom level
              </Typography>
              <Typography variant="body2" color="text.secondary" fontWeight="medium">
                • If chart is slow, toggle off animations →
              </Typography>
            </Box>
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default MoodFlowSankey; 
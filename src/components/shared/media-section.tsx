import { fetchSegments } from "@/hooks/fetch-segment";
import { MediaBox, Section, Segment, config } from "@/models/photo-display";
import React from "react";
import MediaSegment from "./media-segment";

var justifiedLayout = require('justified-layout')

interface SegmentPosType {
    containerHeight: number,
    top: number
}

export default function MediaSection({ width, height, section, visible, top, updateSectionHeight }: { width: number, height: number, section: Section, visible: boolean, top: number, updateSectionHeight: (sectionId: string, newHeight: number) => void }) {

    const [segments, setSegments] = React.useState<Segment[]>([]);
    const sectionRef = React.useRef<HTMLDivElement>(null);

    const [mediaBoxes, setMediaBoxes] = React.useState<MediaBox[][]>([]);
    const [segmentPoses, setSegmentPoses] = React.useState<SegmentPosType[]>([]);

    const [fullyInitialized, setfullyInitialized] = React.useState<boolean>(false);

    let lastSectionUpdateTimes: any = {};
      

    function populateSegments() {
        fetchSegments(section.sectionId)
            .then(
                d => {
                    if (sectionRef.current) {
                        sectionRef.current.style.height = '100%';
                    }
                    
                    let segmentMargin = 0;
                    let prevSegmentEnd = 20;
                    let segmentPosTemp: SegmentPosType[] = [];
                    let mediaBoxesTemp: MediaBox[][] = [];
                    for (const segment of d) {
                        const sizes = segment.media.map((image: any) => image.metadata);
                        let layout = justifiedLayout(sizes, config);
                        
                        segmentPosTemp.push(
                        (
                            {
                                containerHeight: layout.containerHeight,
                                top: prevSegmentEnd
                            }
                            ))
                        
                        mediaBoxesTemp.push(
                            layout.boxes
                        );
                        prevSegmentEnd += layout.containerHeight + segmentMargin;
                    }
                    console.log(segmentPosTemp);
                    updateSectionHeight(section.sectionId, prevSegmentEnd);

                    setSegments(d);
                    setSegmentPoses(segmentPosTemp);
                    setMediaBoxes(mediaBoxesTemp);

                    setfullyInitialized(true);
                }
            )
    }

    React.useEffect(() => {
        if (visible) {
            populateSegments();
        } else {
            if (sectionRef.current) {
                setfullyInitialized(false);
                setSegments([]);
                setSegmentPoses([]);
                setMediaBoxes([]);

            }
        }
    }, [visible, sectionRef])

    return (
        <div ref={sectionRef} className="section" id={section.sectionId} style={{ width: width, height: height, position: 'absolute', top: `${top}px`, backgroundColor: 'blueviolet' }}>
            {
                fullyInitialized && segmentPoses && mediaBoxes && segments.length > 0 && segments.map((i, index) => {
                    return (
                        <MediaSegment key={i.segmentId} segment={i} mediaBoxes={mediaBoxes[index]} segmentPos={segmentPoses[index]}></MediaSegment>
                    )
                }
                )
            }
        </div>
    );
}
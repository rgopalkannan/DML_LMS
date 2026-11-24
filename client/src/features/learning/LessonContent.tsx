import type { ReactElement } from 'react';
import Markdown from 'react-markdown';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import type { Lesson } from '@/types/api';

const SAFE_URL = /^https:\/\//;

/** Lesson text is Markdown. react-markdown never renders raw HTML, so lesson content cannot inject markup. */
export function LessonContent({ lesson }: { lesson: Lesson }): ReactElement {
  return (
    <div className="space-y-6">
      {lesson.type === 'VIDEO' && lesson.videoUrl && SAFE_URL.test(lesson.videoUrl) && (
        <Alert title="Video lesson">
          <p>This video is hosted by a third party and opens in a new tab.</p>
          <Button asChild variant="secondary" size="sm" className="mt-3">
            <a href={lesson.videoUrl} target="_blank" rel="noopener noreferrer">
              Watch the video
            </a>
          </Button>
        </Alert>
      )}
      <article className="space-y-4 leading-relaxed [&_h2]:mt-6 [&_h2]:text-xl [&_h2]:font-bold [&_li]:ml-6 [&_ol]:list-decimal [&_ul]:list-disc [&_strong]:font-semibold [&_em]:text-ink-muted [&_table]:w-full [&_td]:border [&_td]:border-line [&_td]:p-2 [&_th]:border [&_th]:border-line [&_th]:p-2">
        <Markdown>{lesson.body}</Markdown>
      </article>
    </div>
  );
}

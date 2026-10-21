import { Component, inject, signal } from '@angular/core';
import { RssFeed } from '../../shared/types/rss-feed';
import { firstValueFrom } from 'rxjs';
import { RssFeedService } from '../../core/services/rss-feed-service';
import {
  FieldTree,
  form,
  FormField,
  FormRoot,
  pattern,
  required,
} from '@angular/forms/signals';

const EMPTY_FEED = { name: '', url: '' };

@Component({
  selector: 'app-rss-feeds',
  imports: [FormField, FormRoot],
  templateUrl: './rss-feeds.html',
  styleUrl: './rss-feeds.css',
})
export class RssFeeds {
  private readonly feedService = inject(RssFeedService);

  readonly feeds = this.feedService.allResource();
  saving = signal<boolean>(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);
  isCreating = signal<boolean>(false);
  editingFeed = signal<RssFeed | null>(null);
  showDeleteConfirm = signal<string | null>(null);

  private readonly feedModel = signal({ ...EMPTY_FEED });
  readonly feedForm = form(
    this.feedModel,
    (feed) => {
      required(feed.name, { message: 'Name is required' });
      required(feed.url, { message: 'Url is required' });
      pattern(feed.url, /^https?:\/\/.+/, {
        message:
          'Please enter a valid URL (must start with http:// or https://)',
      });
    },
    { submission: { action: () => this.saveFeed() } },
  );

  startCreating(): void {
    this.isCreating.set(true);
    this.editingFeed.set(null);
    this.clearMessages();
    this.feedForm().reset({ ...EMPTY_FEED });
  }

  startEditing(feed: RssFeed): void {
    this.editingFeed.set(feed);
    this.isCreating.set(false);
    this.clearMessages();
    this.feedForm().reset({ name: feed.name, url: feed.url });
  }

  cancelForm(): void {
    this.isCreating.set(false);
    this.editingFeed.set(null);
    this.clearMessages();
    this.feedForm().reset({ ...EMPTY_FEED });
  }

  private async saveFeed(): Promise<void> {
    try {
      this.saving.set(true);
      this.clearMessages();

      const formData = this.feedModel();
      const editingFeed = this.editingFeed();

      if (editingFeed) {
        const updatedFeed: RssFeed = { ...editingFeed, ...formData };
        await firstValueFrom(this.feedService.update(updatedFeed));
        this.feeds.update((feeds) =>
          feeds?.map((feed) =>
            feed.id === editingFeed.id ? updatedFeed : feed,
          ),
        );
        this.success.set('RSS feed updated successfully!');
      } else {
        const newFeed = await firstValueFrom(this.feedService.create(formData));
        this.feeds.update((feeds) => [...(feeds ?? []), newFeed]);
        this.success.set('RSS feed created successfully!');
      }

      this.cancelForm();

      // Clear success message after 3 seconds
      setTimeout(() => this.success.set(null), 3000);
    } catch (err: any) {
      let message = 'Failed to save RSS feed';
      if (err && err.error) {
        message += `: ${err.error}`;
      }
      this.error.set(message);
      console.error(message, err);
    } finally {
      this.saving.set(false);
    }
  }

  confirmDelete(feedId: string): void {
    this.showDeleteConfirm.set(feedId);
  }

  cancelDelete(): void {
    this.showDeleteConfirm.set(null);
  }

  async deleteFeed(feedId: string): Promise<void> {
    try {
      this.saving.set(true);
      this.clearMessages();

      await firstValueFrom(this.feedService.delete(feedId));

      this.feeds.update((feeds) => feeds?.filter((feed) => feed.id !== feedId));
      this.showDeleteConfirm.set(null);
      this.success.set('RSS feed deleted successfully!');

      // Clear success message after 3 seconds
      setTimeout(() => this.success.set(null), 3000);
    } catch (err) {
      this.error.set('Failed to delete RSS feed');
      console.error('Error deleting feed:', err);
    } finally {
      this.saving.set(false);
    }
  }

  fieldError(field: FieldTree<string>): string | null {
    const state = field();
    return state.invalid() && state.touched()
      ? (state.errors()[0]?.message ?? null)
      : null;
  }

  private clearMessages(): void {
    this.error.set(null);
    this.success.set(null);
  }
}

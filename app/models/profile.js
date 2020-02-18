import Model, { attr, hasMany } from '@ember-data/model';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class UserModel extends Model {
  @tracked articles;

  @service session;

  @attr('string') bio;
  @attr('string') image;
  @attr('boolean') following;

  @hasMany('article', { async: false, inverse: 'author' }) articles;

  async loadArticles() {
    let articles = await this.store.loadRecords('article', { author: this.id });
    this.articles = articles;
  }

  fetchFavorites() {
    return this.store.loadRecords('article', { favorited: this.id });
  }

  async follow() {
    await this.followOperation('follow');
  }

  async unfollow() {
    await this.followOperation('unfollow');
  }

  async followOperation(operation) {
    let { profile } = await this.session.fetch(
      `/profiles/${this.id}/follow`,
      operation === 'follow' ? 'POST' : 'DELETE',
    );
    this.store.pushPayload({
      profiles: [Object.assign(profile, { id: profile.username })],
    });
  }
}

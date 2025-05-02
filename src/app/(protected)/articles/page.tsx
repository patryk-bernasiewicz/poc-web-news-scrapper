import { fetchArticles } from './fetch-articles';

export default async function ArticlesPage() {
  const articles = await fetchArticles();

  return (
    <div className="flex flex-col items-start">
      <h1 className="text-2xl font-bold">Artykuły</h1>
      <div>
        <ul className="flex flex-col items-start list-decimal">
          {articles?.length ? (
            articles.map((article) => (
              <li key={article.id} className="my-2">
                <a
                  href={article.link}
                  target="_blank"
                  className="text-blue-500 hover:underline"
                >
                  {article.title}
                </a>
              </li>
            ))
          ) : (
            <div>No articles to show.</div>
          )}
        </ul>
      </div>
    </div>
  );
}

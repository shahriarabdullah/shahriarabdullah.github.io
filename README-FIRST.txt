YOUR WEBSITE — NO SOFTWARE INSTALLATION NEEDED

1. Unzip sahriar-website.zip on your computer.
2. Go to https://github.com/new and create a PUBLIC repository named EXACTLY:
   shahriarabdullah.github.io
   under the account shahriarabdullah.
3. Open the new repository. Click "uploading an existing file" or Add file > Upload files.
4. Upload ALL files AND folders inside the unzipped sahriar-website folder.
   IMPORTANT: index.html should appear at the TOP LEVEL of the repository.
   Do not upload the .zip itself. Some browsers do not upload folders recursively;
   if folders are missing, use GitHub's web editor or GitHub Desktop.
5. Commit changes.
6. Go to repository Settings > Pages. Under "Build and deployment":
   Source = "Deploy from a branch", Branch = "main", folder = "/ (root)". Save.
7. Visit https://shahriarabdullah.github.io/ after GitHub finishes publishing.

TO EDIT FROM YOUR BROWSER (including your phone):
Visit https://shahriarabdullah.github.io/admin/
Click "Sign in with token". Follow the GitHub token creation link.
Use a fine-grained token limited to your one repository, with
Contents: Read and write. Keep your token secret. Do not put it in website files.
The admin has Thoughts, Research, Photography, Quotes, and Page settings.
Click Save/Publish and refresh the public site after GitHub Pages updates.
Draft toggle hides Thoughts/Research/Photo albums from public view.

IMPORTANT TECHNICAL NOTES:
* This version is intentionally plain HTML/CSS/JavaScript, with NO Astro build.
  That is what makes upload-and-publish possible with no commands.
* Images are uploaded to /uploads (regular browser lazy loading; no Astro image optimization).
* This site loads external Google Fonts, the marked/DOMPurify Markdown libraries,
  and Sveltia CMS from public CDNs. Site hosting and editing are free.
* Your thoughts and other content are in content/*.json in your GitHub repository.
* The text for the Qur'an verses is an English meaning/paraphrase; check against
  a primary Qur'an translation before presenting any as exact translated quotes.
* Opening index.html as a local file (file://) won't work because browsers block
  reading local JSON; use the GitHub Pages URL.
* Repo must be public on a free GitHub account for Pages.

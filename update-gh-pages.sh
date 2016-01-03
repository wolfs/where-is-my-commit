set -e
if [ "$TRAVIS_PULL_REQUEST" == "false" ] && [ "$TRAVIS_BRANCH" == "master" ]; then
  echo -e "Starting to update gh-pages\n"

  GH_REPO="@github.com/$TRAVIS_REPO_SLUG.git"
  FULL_REPO="https://$TOKEN$GH_REPO"
  
  #copy data we're interested in to other place
  cp -R dist $HOME/dist

  #go to home and setup git
  cd $HOME
  git config --global user.email "travis@travis-ci.org"
  git config --global user.name "Travis"

  #using token clone gh-pages branch
  git clone --quiet --branch=gh-pages $FULL_REPO gh-pages > /dev/null

  #go into directory and copy data we're interested in to that directory
  cd gh-pages
  rm -rf dist
  cp -Rf $HOME/dist/ .

  #add, commit and push files
  git add --all -f .
  git commit -m "Travis build $TRAVIS_BUILD_NUMBER pushed to gh-pages"
  git push -fq origin gh-pages > /dev/null

  echo -e "Finished updating gh-pages\n"
fi

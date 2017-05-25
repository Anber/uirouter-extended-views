import md5 from 'js-md5';

export function getFullToken(viewName, origToken, sync = false) {
    const viewHash = md5(viewName);
    return `${origToken}$${viewHash}${sync ? '$sync' : ''}`;
}

export function getFullViewName({ viewDecl: { $uiViewContextAnchor: stateName, $name: viewName } }) {
    return viewName.indexOf('@') >= 0 ? viewName : `${viewName}@${stateName}`;
}
